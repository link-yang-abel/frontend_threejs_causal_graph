import { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Settings } from "lucide-react"
// import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  // DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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

interface CurveWithColor extends CurveLine {
  color: THREE.Color;
  title: string;
}

export default function CausalGraph() {
  const [points, setPoints] = useState<Point[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const sphereRadius = 5;
  const pointIdCounter = useRef(0);
  const curveIdCounter = useRef(0);
  const [showModal, setShowModal] = useState(false);
  const [newPointTitle, setNewPointTitle] = useState('');
  const [isAddingCurve, ] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState<Point[]>([]);
  const [showCurveModal, setShowCurveModal] = useState(false);
  const [newCurveTitle, setNewCurveTitle] = useState('');
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [hoveredCurve, setHoveredCurve] = useState<number | null>(null);
  const [showAxes, setShowAxes] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [showCurves, setShowCurves] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [open, setOpen] = useState(false);

  // 为点生成明亮的颜色
  const generatePointColor = () => {
    // 使用更鲜艳的色相范围
    const hue = Math.random();
    // 高饱和度，范围从 0.85 到 1.0
    const saturation = 0.85 + Math.random() * 0.15;
    // 高亮度，范围从 0.7 到 0.9
    const lightness = 0.7 + Math.random() * 0.2;
    
    return new THREE.Color().setHSL(hue, saturation, lightness);
  };

  // 为线生成柔和的颜色
  const generateCurveColor = () => {
    // 使用更柔和的色相范围
    const hue = Math.random();
    // 中等饱和度，范围从 0.6 到 0.8
    const saturation = 0.6 + Math.random() * 0.2;
    // 中等亮度，范围从 0.5 到 0.7
    const lightness = 0.5 + Math.random() * 0.2;
    
    return new THREE.Color().setHSL(hue, saturation, lightness);
  };

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
        color: generatePointColor()
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
            color: generateCurveColor(),
            title: `Curve ${curveIdCounter.current}`
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

  const addNewPoint = () => {
    // 在球面上随机生成一个点
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    
    const x = sphereRadius * Math.sin(theta) * Math.cos(phi);
    const y = sphereRadius * Math.sin(theta) * Math.sin(phi);
    const z = sphereRadius * Math.cos(theta);
    
    const position = new THREE.Vector3(x, y, z);
    
    const newPoint: Point = {
      position,
      id: pointIdCounter.current++,
      title: newPointTitle || `Point ${pointIdCounter.current}`,
      color: generatePointColor()
    };

    // 添加新点
    setPoints(prevPoints => [...prevPoints, newPoint]);

    // 只为新点添加连接线
    if (points.length >= 3) {
      const nearestPoints = findNearestPoints(position, points, 3);
      nearestPoints.forEach(nearPoint => {
        const newCurve: CurveWithColor = {
          start: nearPoint.position,
          end: position,
          id: curveIdCounter.current++,
          color: generateCurveColor(),
          title: `Curve ${curveIdCounter.current}`
        };
        setCurves(prev => [...prev, newCurve]);
      });
    }

    setShowModal(false);
    setNewPointTitle('');
  };

  // 添加删除点的函数
  const deletePoint = (pointId: number) => {
    // 删除点
    setPoints(prevPoints => prevPoints.filter(p => p.id !== pointId));
    
    // 删除与该点相关的所有曲线
    setCurves(prevCurves => prevCurves.filter(curve => 
      !(curve.start.equals(points.find(p => p.id === pointId)?.position!) || 
        curve.end.equals(points.find(p => p.id === pointId)?.position!))
    ));
  };

  // 添加删除线的函数
  const deleteCurve = (curveId: number) => {
    setCurves(prevCurves => prevCurves.filter(c => c.id !== curveId));
  };

  // 添加新曲线的函数
  const addNewCurve = () => {
    if (startPoint && endPoint) {
      const newCurve: CurveWithColor = {
        start: startPoint.position,
        end: endPoint.position,
        id: curveIdCounter.current++,
        color: generateCurveColor(),
        title: newCurveTitle || `Curve ${curveIdCounter.current}`
      };
      setCurves(prev => [...prev, newCurve]);
      
      // 重置状态
      setStartPoint(null);
      setEndPoint(null);
      setNewCurveTitle('');
      setShowCurveModal(false);
    }
  };

  // 处理点击点的事件
  const handlePointClick = (point: Point) => {
    if (!isAddingCurve) return;

    setSelectedPoints(prev => {
      const newSelected = [...prev, point];
      if (newSelected.length === 2) {
        addNewCurve();
        return [];
      }
      return newSelected;
    });
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* 设置按钮 - 调整位置和样式 */}
      <div className="absolute top-4 right-4 z-50">
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 w-10">
            <Settings className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Settings</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px] bg-background/95 backdrop-blur">
            <div className="flex items-center justify-between p-2">
              <Label htmlFor="show-axes">Show Axes</Label>
              <Switch
                id="show-axes"
                checked={showAxes}
                onCheckedChange={setShowAxes}
              />
            </div>
            <div className="flex items-center justify-between p-2">
              <Label htmlFor="show-points">Show Points</Label>
              <Switch
                id="show-points"
                checked={showPoints}
                onCheckedChange={setShowPoints}
              />
            </div>
            <div className="flex items-center justify-between p-2">
              <Label htmlFor="show-curves">Show Curves</Label>
              <Switch
                id="show-curves"
                checked={showCurves}
                onCheckedChange={setShowCurves}
              />
            </div>
            <div className="flex items-center justify-between p-2">
              <Label htmlFor="show-sidebar">Show Sidebar</Label>
              <Switch
                id="show-sidebar"
                checked={showSidebar}
                onCheckedChange={setShowSidebar}
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'rgba(128, 128, 128, 0.95)',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '300px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Add New Point</h3>
            <input
              type="text"
              value={newPointTitle}
              onChange={(e) => setNewPointTitle(e.target.value)}
              placeholder="Enter point title"
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '15px',
                borderRadius: '4px',
                border: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '8px 12px',
                  background: '#666',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addNewPoint}
                style={{
                  padding: '8px 12px',
                  background: '#4444ff',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 侧边栏 */}
      {showSidebar && (
        <div style={{
          width: '320px',
          minWidth: '320px',
          padding: '20px',
          background: 'rgba(128, 128, 128, 0.8)',
          color: 'white',
          height: '100vh',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          {/* 点列表 */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px',
              padding: '0 5px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                Points ({points.length})
              </h3>
              <button
                onClick={() => setShowModal(true)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(68, 68, 255, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Add Point
              </button>
            </div>
            <div style={{ 
              maxHeight: '40vh', 
              overflowY: 'auto',
              borderBottom: '1px solid rgba(255,255,255,0.3)',
              marginBottom: '20px',
              paddingBottom: '15px',
              paddingRight: '10px'
            }}>
              {points.map(point => (
                <div 
                  key={point.id}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: hoveredPoint === point.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={() => setHoveredPoint(point.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div 
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: point.color.getStyle()
                      }}
                    />
                    <span>{point.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePoint(point.id);
                    }}
                    style={{
                      background: 'rgba(255, 77, 77, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 线列表 */}
          <div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '15px',
              padding: '0 5px'
            }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>
                Curves ({curves.length})
              </h3>
              <button
                onClick={() => setShowCurveModal(true)}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(68, 68, 255, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                Add Curve
              </button>
            </div>
            <div style={{ 
              maxHeight: '40vh', 
              overflowY: 'auto',
              paddingRight: '10px'
            }}>
              {curves.map(curve => (
                <div 
                  key={curve.id}
                  style={{
                    padding: '8px',
                    marginBottom: '4px',
                    background: hoveredCurve === curve.id ? 'rgba(255,255,255,0.2)' : 'transparent',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    justifyContent: 'space-between'
                  }}
                  onMouseEnter={() => setHoveredCurve(curve.id)}
                  onMouseLeave={() => setHoveredCurve(null)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div 
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: curve.color.getStyle()
                        }}
                      />
                      <span>{curve.title}</span>
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'rgba(255,255,255,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{points.find(p => p.position.equals(curve.start))?.title}</span>
                      <span>→</span>
                      <span>{points.find(p => p.position.equals(curve.end))?.title}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCurve(curve.id);
                    }}
                    style={{
                      background: 'rgba(255, 77, 77, 0.8)',
                      border: 'none',
                      borderRadius: '4px',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3D场景 */}
      <div style={{ flex: 1 }}>
        <Canvas camera={{ position: [0, 0, 15] }}>
          {/* 添加多个光源以更好地照亮场景 */}
          <ambientLight intensity={0.8} /> {/* 增加环境光强度 */}
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />
          <directionalLight position={[0, 0, 5]} intensity={0.5} />

          {showAxes && (
            <>
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
            </>
          )}

          {/* 点 */}
          {showPoints && points.map((point) => (
            <mesh 
              key={point.id} 
              position={point.position}
              onPointerOver={() => {
                setHoveredPoint(point.id);
                document.body.style.cursor = isAddingCurve ? 'pointer' : 'default';
              }}
              onPointerOut={() => {
                setHoveredPoint(null);
                document.body.style.cursor = 'default';
              }}
              onClick={() => handlePointClick(point)}
            >
              <sphereGeometry args={[0.1, 16, 16]} />
              <meshStandardMaterial  // 使用 StandardMaterial 来获得更好的光照效果
                color={selectedPoints.includes(point) ? 'yellow' : point.color}
                metalness={0.1}
                roughness={0.5}
              />
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
          {showCurves && curves.map((curve) => (
            <group key={curve.id}>
              <line>
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

              {hoveredCurve === curve.id && (
                <Html
                  position={getMidPointPosition(curve.start, curve.end, sphereRadius)}
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
                  {curve.title}
                </Html>
              )}
            </group>
          ))}

          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
        </Canvas>
      </div>

      {/* 添加曲线的模态框 */}
      {showCurveModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 2000
        }}>
          <div style={{
            background: 'rgba(128, 128, 128, 0.95)',
            padding: '20px',
            borderRadius: '8px',
            minWidth: '300px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Add New Curve</h3>
            
            {/* 起点选择 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>
                Start Point
              </label>
              <select
                value={startPoint?.id ?? ''}
                onChange={(e) => setStartPoint(points.find(p => p.id === Number(e.target.value)) || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none'
                }}
              >
                <option value="">Select start point</option>
                {points.map(point => (
                  <option key={point.id} value={point.id}>
                    {point.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 终点选择 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>
                End Point
              </label>
              <select
                value={endPoint?.id ?? ''}
                onChange={(e) => setEndPoint(points.find(p => p.id === Number(e.target.value)) || null)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none'
                }}
              >
                <option value="">Select end point</option>
                {points.filter(p => p.id !== startPoint?.id).map(point => (
                  <option key={point.id} value={point.id}>
                    {point.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 标题输入 */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>
                Curve Title
              </label>
              <input
                type="text"
                value={newCurveTitle}
                onChange={(e) => setNewCurveTitle(e.target.value)}
                placeholder="Enter curve title"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: 'none'
                }}
              />
            </div>

            {/* 按钮组 */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCurveModal(false);
                  setStartPoint(null);
                  setEndPoint(null);
                  setNewCurveTitle('');
                }}
                style={{
                  padding: '8px 12px',
                  background: '#666',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addNewCurve}
                disabled={!startPoint || !endPoint}
                style={{
                  padding: '8px 12px',
                  background: !startPoint || !endPoint ? '#666' : '#4444ff',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: !startPoint || !endPoint ? 'not-allowed' : 'pointer'
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
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

// 修改获取中点位置的函数
function getMidPointPosition(start: THREE.Vector3, end: THREE.Vector3, radius: number): THREE.Vector3 {
  const curvature = 0.3; // 与曲线使用相同的弯曲程度
  
  // 计算中点和随机偏移，与曲线生成使用相同的逻辑
  const midPoint = new THREE.Vector3().lerpVectors(start, end, 0.5);
  const randomOffset = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2,
    (Math.random() - 0.5) * 2
  ).multiplyScalar(radius * curvature);
  
  return midPoint.add(randomOffset);
}

// 获取箭头旋转
// function getArrowRotation(start: THREE.Vector3, end: THREE.Vector3): [number, number, number] {
//   const direction = end.clone().sub(start);
//   const euler = new THREE.Euler();
//   euler.setFromQuaternion(new THREE.Quaternion().setFromUnitVectors(
//     new THREE.Vector3(0, 0, 1),
//     direction.normalize()
//   ));
//   return [euler.x, euler.y, euler.z];
// } 