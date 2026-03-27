export interface Template {
  id: string;
  name: string;
  description: string;
  header: (title: string) => string;
  footer: () => string;
  containerClass: string; // Tailwind classes for the main wrapper
}

export const templates: Template[] = [
  {
    id: 'minimal',
    name: 'Tối giản',
    description: 'Thiết kế sạch sẽ, tập trung tối đa vào nội dung.',
    header: (title) => `
      <header style="margin-bottom: 2.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 1.5rem;">
        <h1 style="font-size: 2rem; font-weight: 700; color: #111827; margin: 0;">${title || 'Tài liệu không tiêu đề'}</h1>
        <p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Ngày xuất bản: ${new Date().toLocaleDateString('vi-VN')}</p>
      </header>
    `,
    footer: () => `
      <footer style="margin-top: 4rem; border-top: 1px solid #e5e7eb; padding-top: 1.5rem; text-align: center; font-size: 0.75rem; color: #9ca3af;">
        <p>© ${new Date().getFullYear()} Word to HTML Converter. Tất cả quyền được bảo lưu.</p>
      </footer>
    `,
    containerClass: 'max-w-3xl mx-auto py-12 px-6 bg-white'
  },
  {
    id: 'corporate',
    name: 'Chuyên nghiệp',
    description: 'Phong cách doanh nghiệp với thanh tiêu đề đậm.',
    header: (title) => `
      <header style="background-color: #4f46e5; color: white; padding: 2.5rem; margin-bottom: 3rem; border-radius: 0.5rem; font-family: sans-serif;">
        <div style="text-transform: uppercase; font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; margin-bottom: 0.75rem; opacity: 0.9;">Báo cáo nội bộ</div>
        <h1 style="font-size: 2.5rem; font-weight: 800; margin: 0; line-height: 1.2;">${title || 'Tài liệu Doanh nghiệp'}</h1>
      </header>
    `,
    footer: () => `
      <footer style="background-color: #f9fafb; border-top: 4px solid #4f46e5; padding: 2.5rem; margin-top: 5rem; border-radius: 0.5rem; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="font-size: 0.875rem; color: #111827; font-weight: 700;">PHÒNG BAN PHÁT TRIỂN NỘI DUNG</div>
            <div style="font-size: 0.75rem; color: #6b7280; margin-top: 0.25rem;">Tài liệu bảo mật • Lưu hành nội bộ</div>
          </div>
          <div style="font-size: 0.75rem; color: #9ca3af;">Trang 1 / 1</div>
        </div>
      </footer>
    `,
    containerClass: 'max-w-4xl mx-auto py-16 px-8 bg-white shadow-xl my-8 rounded-lg'
  },
  {
    id: 'modern',
    name: 'Hiện đại',
    description: 'Giao diện hiện đại với các đường kẻ cách điệu.',
    header: (title) => `
      <header style="margin-bottom: 4rem; position: relative; font-family: sans-serif;">
        <div style="width: 4rem; height: 0.35rem; background-color: #ec4899; margin-bottom: 1.5rem;"></div>
        <h1 style="font-size: 3.5rem; font-weight: 900; color: #1f2937; line-height: 1; margin: 0; letter-spacing: -0.02em;">${title || 'Khám phá'}</h1>
        <div style="margin-top: 2rem; display: flex; gap: 1rem; font-size: 0.75rem; font-weight: 700; color: #ec4899; text-transform: uppercase; letter-spacing: 0.05em;">
          <span>#Design</span><span>•</span><span>#Content</span><span>•</span><span>#Modern</span>
        </div>
      </header>
    `,
    footer: () => `
      <footer style="margin-top: 6rem; padding-top: 3rem; border-top: 1px dashed #d1d5db; font-family: sans-serif;">
        <div style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 2rem;">
          <div style="flex: 1; min-width: 200px;">
            <h3 style="font-weight: 800; color: #1f2937; margin-bottom: 0.75rem; font-size: 1.125rem;">Word to HTML</h3>
            <p style="font-size: 0.875rem; color: #6b7280; max-width: 300px; line-height: 1.6;">Công cụ chuyển đổi tài liệu thông minh giúp tối ưu hóa quy trình làm việc của bạn.</p>
          </div>
          <div style="display: flex; gap: 0.75rem;">
            <div style="width: 2.5rem; height: 2.5rem; background-color: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4b5563;">f</div>
            <div style="width: 2.5rem; height: 2.5rem; background-color: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4b5563;">t</div>
            <div style="width: 2.5rem; height: 2.5rem; background-color: #f3f4f6; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #4b5563;">in</div>
          </div>
        </div>
      </footer>
    `,
    containerClass: 'max-w-3xl mx-auto py-20 px-10 bg-white'
  }
];
