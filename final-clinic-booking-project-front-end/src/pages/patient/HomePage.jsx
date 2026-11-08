import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import SpecialtyGrid from '@/features/booking/components/SpecialtyGrid';

export default function HomePage() {
  return (
    <div className="py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Xin chào 👋</h1>
        <p className="text-slate-500 mt-1">Bạn muốn khám gì hôm nay?</p>
      </div>

      <Link
        to={ROUTES.patient.doctors}
        className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm"
      >
        <Search className="w-5 h-5 text-slate-400" />
        <span className="text-slate-400">Tìm bác sĩ, chuyên khoa...</span>
      </Link>

      <section>
        <h2 className="font-semibold mb-3">Chuyên khoa</h2>
        <SpecialtyGrid />
      </section>
    </div>
  );
}

