export default {
  async fetch(request, env, ctx) {
    // 获取请求的 URL
    const url = new URL(request.url);
    
    // 设置基本的安全响应头
    const headers = new Headers({
      'Content-Type': 'text/html',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    });

    try {
      // 从静态资源中获取响应
      const response = await env.ASSETS.fetch(request);
      
      // 添加安全响应头
      for (const [key, value] of headers.entries()) {
        response.headers.set(key, value);
      }
      
      return response;
    } catch (error) {
      // 如果出错，返回 404 页面
      return new Response('Not Found', { 
        status: 404,
        headers
      });
    }
  }
}; 