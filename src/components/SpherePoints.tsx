import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface Point {
  position: THREE.Vector3;
  id: number;
}

interface CurveLine {
  start: THREE.Vector3;
  end: THREE.Vector3;
  id: number;
}

export const SpherePoints = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [curves, setCurves] = useState<CurveLine[]>([]);
  const sphereRadius = 5;
  let pointIdCounter = useRef(0);
  let curveIdCounter = useRef(0);

  const addPointOnSphere = (event: any) => {
    if (event.button === 0) { // 左键点击
      const { point } = event;
      // 将点标准化到球面上
      const normalizedPoint = point.normalize().multiplyScalar(sphereRadius);
      
      const newPoint: Point = {
        position: normalizedPoint,
        id: pointIdCounter.current++
      };

      setPoints(prevPoints => {
        const newPoints = [...prevPoints, newPoint];
        // 如果有多个点，创建与最近点的连接
        if (prevPoints.length > 0) {
          const nearestPoint = findNearestPoint(normalizedPoint, prevPoints);
          if (nearestPoint) {
            const newCurve: CurveLine = {
              start: nearestPoint.position,
              end: normalizedPoint,
              id: curveIdCounter.current++
            };
            setCurves(prev => [...prev, newCurve]);
          }
        }
        return newPoints;
      });
    }
  };

  const findNearestPoint = (position: THREE.Vector3, points: Point[]) => {
    let nearest = points[0];
    let minDistance = position.distanceTo(points[0].position);
    
    points.forEach(point => {
      const distance = position.distanceTo(point.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });
    
    return nearest;
  };

  return (
    <Canvas camera={{ position: [0, 0, 15] }} onClick={addPointOnSphere}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* 基础球体 */}
      <mesh>
        <sphereGeometry args={[sphereRadius, 32, 32]} />
        <meshPhongMaterial wireframe color="gray" transparent opacity={0.3} />
      </mesh>

      {/* 点 */}
      {points.map((point) => (
        <mesh key={point.id} position={point.position}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhongMaterial color="red" />
        </mesh>
      ))}

      {/* 曲线 */}
      {curves.map((curve) => (
        <line key={curve.id}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={50}
              array={generateCurvePoints(curve.start, curve.end, sphereRadius)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="blue" />
        </line>
      ))}

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

// 生成球面上的曲线点
function generateCurvePoints(start: THREE.Vector3, end: THREE.Vector3, radius: number): Float32Array {
  const points = new Float32Array(50 * 3);
  const segments = 49;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    // 使用球面插值
    const point = new THREE.Vector3().lerpVectors(start, end, t);
    point.normalize().multiplyScalar(radius);
    
    points[i * 3] = point.x;
    points[i * 3 + 1] = point.y;
    points[i * 3 + 2] = point.z;
  }

  return points;
} 