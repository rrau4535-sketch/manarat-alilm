import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Video, Radio, Users, BookOpen, Heart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'من نحن',
  description: 'منصة الدعوة - منصة إسلامية متخصصة في الرد على الشبهات والحوار مع المخالفين',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* Hero */}
      <div className="text-center mb-14">
        <div className="w-20 h-20 bg-[#C19A6B] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white font-extrabold text-4xl">د</span>
        </div>
        <h1 className="text-4xl font-extrabold text-[#2C3E50] mb-4">منصة الدعوة</h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          منصة إسلامية متخصصة في الرد على الشبهات والحوار العلمي مع المخالفين
        </p>
      </div>

      {/* Mission */}
      <div className="card mb-8 bg-gradient-to-bl from-[#2C3E50]/5 to-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#C19A6B] rounded-2xl flex items-center justify-center flex-shrink-0">
            <Heart size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#2C3E50] mb-3">رسالتنا</h2>
            <p className="text-gray-600 leading-relaxed">
              نسعى إلى تقديم محتوى دعوي علمي راقٍ يُجيب على أسئلة الباحثين عن الحق،
              ويرد على شبهات المخالفين بأسلوب علمي هادئ ومحترم.
              هدفنا نشر الإسلام الصحيح بالحكمة والموعظة الحسنة.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <h2 className="text-2xl font-bold text-[#2C3E50] mb-6 text-center">ماذا نقدم؟</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
        {[
          { icon: Video, title: 'فيديوهات دعوية', desc: 'مكتبة ضخمة من الفيديوهات المصنّفة حسب الموضوع', color: 'text-blue-500 bg-blue-50' },
          { icon: Radio, title: 'بث مباشر', desc: 'حوارات ومناظرات مباشرة مع المخالفين', color: 'text-red-500 bg-red-50' },
          { icon: BookOpen, title: 'الرد على الشبهات', desc: 'ردود علمية موثقة على أكثر الشبهات شيوعاً', color: 'text-emerald-500 bg-emerald-50' },
          { icon: Users, title: 'مجتمع تفاعلي', desc: 'شات مباشر وتفاعل مع الدعاة والمتابعين', color: 'text-purple-500 bg-purple-50' },
        ].map(({ icon: Icon, title, desc, color }) => (
          <div key={title} className="card hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
              <Icon size={22} />
            </div>
            <h3 className="font-bold text-[#2C3E50] mb-2">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-[#2C3E50] mb-5">التخصصات</h2>
        <div className="space-y-4">
          {[
            { icon: '🔬', title: 'الرد على الإلحاد', desc: 'حوارات ومناظرات علمية وفلسفية مع الملحدين' },
            { icon: '✝️', title: 'الحوار مع النصارى', desc: 'نقاشات عقدية وتفسيرية مقارنة مع المسيحيين' },
            { icon: '💡', title: 'الشبهات والردود', desc: 'إجابات واضحة وموثقة على أكثر الشبهات شيوعاً' },
          ].map(item => (
            <div key={item.title} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-bold text-[#2C3E50]">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center bg-gradient-to-b from-[#2C3E50] to-[#3D5166] rounded-3xl p-10 text-white">
        <h2 className="text-2xl font-extrabold mb-3">انضم إلى المنصة</h2>
        <p className="text-gray-300 mb-6">سجّل الآن وتابع كل المحتوى الدعوي</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/auth" className="bg-[#C19A6B] hover:bg-[#A8814F] text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            إنشاء حساب مجاني
          </Link>
          <Link href="/" className="border border-white/30 hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            تصفح الفيديوهات
          </Link>
        </div>
      </div>
    </div>
  );
}
