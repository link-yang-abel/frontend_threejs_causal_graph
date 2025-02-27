export function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to abel.ai demo</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Causal Graph</h2>
          <p className="text-muted-foreground mb-4">
            Interactive 3D visualization of causal relationships in a spherical space.
          </p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Bubble</h2>
          <p className="text-muted-foreground mb-4">
            Interactive bubble chart visualization.
          </p>
        </div>
      </div>
    </div>
  )
} 