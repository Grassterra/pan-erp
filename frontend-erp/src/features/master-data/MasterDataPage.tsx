import { Database, Settings } from 'lucide-react';
import type React from 'react';
import { Link } from 'react-router-dom';

interface MasterDataModule {
  title: string;
  description: string;
  icon: React.ElementType;
  link: string;
  color: string;
}

export function MasterDataPage() {
  const modules: MasterDataModule[] = [
    {
      title: 'Items',
      description: 'Finished Goods, Semifinished Goods, and Raw Materials',
      icon: Database,
      link: '/master-data/items',
      color: 'bg-indigo-500',
    },
    {
      title: 'Module 2',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-blue-500',
    },
    {
      title: 'Module 3',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-emerald-500',
    },
    {
      title: 'Module 4',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-orange-500',
    },
  ];

  const specialModules: MasterDataModule[] = [
    {
      title: 'Special 1',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-pink-500',
    },
    {
      title: 'Special 2',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-rose-500',
    },
    {
      title: 'Special 3',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-amber-500',
    },
    {
      title: 'Special 4',
      description: 'Placeholder master data module',
      icon: Database,
      link: '/master-data',
      color: 'bg-lime-500',
    },
  ];

  const renderModuleCard = (module: MasterDataModule) => (
    <Link key={module.title} to={module.link} className='bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6'>
      <div className='flex items-start gap-4'>
        <div className={`${module.color} p-3 rounded-lg`}>
          <module.icon className='h-6 w-6 text-white' />
        </div>
        <div className='flex-1'>
          <h3 className='text-lg font-semibold text-gray-900'>{module.title}</h3>
          <p className='text-sm text-gray-500 mt-1'>{module.description}</p>
        </div>
      </div>
    </Link>
  );

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Master Data</h1>
          <p className='text-gray-500 mt-1'>Manage all master data and settings</p>
        </div>
        <Link to='/' className='flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50'>
          <Settings className='h-5 w-5' />
          Settings
        </Link>
      </div>

      <div className='mb-8'>
        <h2 className='text-lg font-semibold text-gray-800 mb-4'>General</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>{modules.map(renderModuleCard)}</div>
      </div>

      <div>
        <h2 className='text-lg font-semibold text-gray-800 mb-4'>Special</h2>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>{specialModules.map(renderModuleCard)}</div>
      </div>
    </div>
  );
}
