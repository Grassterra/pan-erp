import { useNavigate, useParams } from 'react-router-dom';
import { UserForm } from './UserForm';

export function UserFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <UserForm
        id={id ? Number(id) : undefined}
        onSuccess={() => navigate('/users')}
        onCancel={() => navigate('/users')}
      />
    </div>
  );
 }
