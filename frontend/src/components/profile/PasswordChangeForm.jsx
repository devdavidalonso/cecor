import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const PasswordChangeForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    // Validação de senha atual
    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Senha atual é obrigatória';
    }
    
    // Validação de nova senha
    if (!formData.newPassword) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Nova senha deve ter pelo menos 6 caracteres';
    }
    
    // Validação de confirmação de senha
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando alterado
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        id="currentPassword"
        name="currentPassword"
        type="password"
        label="Senha Atual"
        value={formData.currentPassword}
        onChange={handleChange}
        error={errors.currentPassword}
        required
        disabled={loading}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          label="Nova Senha"
          value={formData.newPassword}
          onChange={handleChange}
          error={errors.newPassword}
          required
          disabled={loading}
        />
        
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmar Nova Senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
          disabled={loading}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
        >
          Alterar Senha
        </Button>
      </div>
    </form>
  );
};

export default PasswordChangeForm;