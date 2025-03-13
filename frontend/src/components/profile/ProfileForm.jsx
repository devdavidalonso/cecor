import { useState } from 'react';
import Input from '../common/Input';
import Button from '../common/Button';

const ProfileForm = ({
  userData,
  onSubmit,
  loading,
  isAdmin = false,
}) => {
  const [formData, setFormData] = useState({
    name: userData?.name || '',
    email: userData?.email || '',
    cpf: userData?.cpf || '',
    phone: userData?.phone || '',
    address: userData?.address || '',
    // Não incluímos a senha aqui, pois terá um fluxo separado
  });
  
  const [errors, setErrors] = useState({});

  // Formatadores
  const formatCPF = (value) => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Aplica máscara xxx.xxx.xxx-xx
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    } else if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    } else {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
    }
  };
  
  const formatPhone = (value) => {
    // Remove caracteres não numéricos
    const digits = value.replace(/\D/g, '');
    
    // Aplica máscara (xx) xxxxx-xxxx
    if (digits.length <= 2) {
      return `(${digits}`;
    } else if (digits.length <= 7) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    } else if (digits.length <= 11) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validação de nome
    if (!formData.name) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    }
    
    // Validação de email
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    
    // Validação de CPF
    if (formData.cpf && formData.cpf.replace(/\D/g, '').length !== 11) {
      newErrors.cpf = 'CPF inválido';
    }
    
    // Validação de telefone
    if (formData.phone && formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Formatação para CPF e telefone
    if (name === 'cpf') {
      setFormData(prev => ({ ...prev, cpf: formatCPF(value) }));
    } else if (name === 'phone') {
      setFormData(prev => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="name"
          name="name"
          type="text"
          label="Nome Completo"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          disabled={loading}
        />
        
        <Input
          id="email"
          name="email"
          type="email"
          label="Email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={loading || !isAdmin} // Apenas admin pode alterar email
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          id="cpf"
          name="cpf"
          type="text"
          label="CPF"
          value={formData.cpf}
          onChange={handleChange}
          error={errors.cpf}
          maxLength={14}
          disabled={loading}
        />
        
        <Input
          id="phone"
          name="phone"
          type="text"
          label="Telefone"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          maxLength={15}
          disabled={loading}
        />
      </div>
      
      <Input
        id="address"
        name="address"
        type="text"
        label="Endereço"
        value={formData.address}
        onChange={handleChange}
        error={errors.address}
        disabled={loading}
      />
      
      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
          disabled={loading}
        >
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
};

export default ProfileForm;