import { Outlet } from 'react-router-dom';
import PatientHeader from '@/components/layout/PatientHeader';
import PatientBottomNav from '@/components/layout/PatientBottomNav';

export default function PatientLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <PatientHeader />
      <main className="flex-1 pb-20 px-4">
        <Outlet />
      </main>
      <PatientBottomNav />
    </div>
  );
}




