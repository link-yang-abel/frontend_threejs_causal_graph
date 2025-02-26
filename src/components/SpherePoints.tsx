import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

interface Point {
  position: THREE.Vector3;
  id: number;
  title: string;
  color: THREE.Color;
}

interface CurveLine {
  start: THREE.Vector3;
  end: THREE.Vector3;
  id: number;
}

export const SpherePoints = () => {
  const [points, setPoints] = useState<Point[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const sphereRadius = 5;
  const pointIdCounter = useRef(0);
  const curveIdCounter = useRef(0);

  // 生成随机颜色
  const generateRandomColor = () => {
    const hue = Math.random();
    const saturation = 0.7 + Math.random() * 0.3;
    const lightness = 0.5 + Math.random() * 0.2;
    return new THREE.Color().setHSL(hue, saturation, lightness);
  };

  interface CurveWithColor extends CurveLine {
    color: THREE.Color;
  }

  const [curves, setCurves] = useState<CurveWithColor[]>([]);

  // 生成随机的球面点
  const generateRandomPoints = (count: number) => {
    const newPoints: Point[] = [];
    const newCurves: CurveWithColor[] = [];
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < count; i++) {
      // 使用 Fibonacci 球算法生成均匀分布的点
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const radius = Math.sqrt(1 - y * y); // radius at y
      const theta = 2 * Math.PI * i / goldenRatio; // golden angle increment

      // 转换为笛卡尔坐标
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      const position = new THREE.Vector3(
        x * sphereRadius,
        y * sphereRadius,
        z * sphereRadius
      );
      
      const newPoint: Point = {
        position,
        id: pointIdCounter.current++,
        title: `Point ${pointIdCounter.current}`,
        color: generateRandomColor()
      };
      
      newPoints.push(newPoint);

      // 与最近的3个点连接（除了前3个点）
      if (i >= 3) {
        const nearestPoints = findNearestPoints(position, newPoints.slice(0, -1), 3);
        nearestPoints.forEach(nearPoint => {
          const newCurve: CurveWithColor = {
            start: nearPoint.position,
            end: position,
            id: curveIdCounter.current++,
            color: generateRandomColor()
          };
          newCurves.push(newCurve);
        });
      }
    }

    setPoints(newPoints);
    setCurves(newCurves);
  };

  // 在组件加载时生成点
  useEffect(() => {
    generateRandomPoints(30); // 生成30个点
  }, []);

  // 找到最近的N个点
  const findNearestPoints = (position: THREE.Vector3, points: Point[], count: number) => {
    return points
      .map(point => ({
        point,
        distance: position.distanceTo(point.position)
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, count)
      .map(item => item.point);
  };

  return (
    <Canvas camera={{ position: [0, 0, 15] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      
      {/* 原点 */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshPhongMaterial color="yellow" />
      </mesh>

      {/* 坐标轴 */}
      <group>
        {/* X轴 - 红色 */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-sphereRadius, 0, 0, sphereRadius, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="red" />
        </line>
        
        {/* Y轴 - 绿色 */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -sphereRadius, 0, 0, sphereRadius, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="green" />
        </line>
        
        {/* Z轴 - 蓝色 */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, -sphereRadius, 0, 0, sphereRadius])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="blue" />
        </line>
      </group>

      {/* 点 */}
      {points.map((point) => (
        <mesh 
          key={point.id} 
          position={point.position}
          onPointerOver={() => setHoveredPoint(point.id)}
          onPointerOut={() => setHoveredPoint(null)}
        >
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshPhongMaterial color={point.color} />
          {hoveredPoint === point.id && (
            <Html
              position={[0, 0.2, 0]}
              style={{
                background: 'rgba(128, 128, 128, 0.8)',
                padding: '6px 10px',
                borderRadius: '4px',
                color: 'white',
                fontSize: '12px',
                pointerEvents: 'none',
                transform: 'translate3d(-50%, -50%, 0)'
              }}
            >
              {point.title}
            </Html>
          )}
        </mesh>
      ))}

      {/* 波浪曲线 */}
      {curves.map((curve) => (
        <line key={curve.id}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={100}
              array={generateWavyCurvePoints(curve.start, curve.end, sphereRadius)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={curve.color} />
        </line>
      ))}

      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
    </Canvas>
  );
};

// 生成球面上的随机曲线点
function generateWavyCurvePoints(start: THREE.Vector3, end: THREE.Vector3, radius: number): Float32Array {
  const segments = 99;
  const points = new Float32Array((segments + 1) * 3);
  const tempVector = new THREE.Vector3();
  
  // 控制曲线弯曲程度的参数 (0.0 - 1.0)
  const curvature = 0.3; // 调整这个值来控制曲线跨过球面的程度
  
  // 生成球体内部的随机控制点
  const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
  const randomOffset = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  ).multiplyScalar(radius * curvature); // 使用 curvature 参数控制偏移量
  
  // 控制点可以在球体内部，但受 curvature 参数控制
  const controlPoint = midPoint.add(randomOffset);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // 二次贝塞尔曲线插值
    tempVector.copy(start).multiplyScalar(Math.pow(1 - t, 2))
      .add(controlPoint.clone().multiplyScalar(2 * (1 - t) * t))
      .add(end.clone().multiplyScalar(t * t));
    
    // 不再将中间点投影到球面上
    points[i * 3] = tempVector.x;
    points[i * 3 + 1] = tempVector.y;
    points[i * 3 + 2] = tempVector.z;
  }

  return points;
} 