import { useState, useEffect } from 'react';
import Head from 'next/head';
import { HiUser, HiKey, HiPhotograph } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useAlert } from '../../contexts/AlertContext';
import { handleApiError } from '../../lib/errorHandler';
import { profileService } from '../../lib/api';
import Layout from '../../components/common/Layout';
import ProtectedRoute from '../../components/common/ProtectedRoute';
import Card from '../../components/common/Card';
import ProfileForm from '../../components/profile/ProfileForm';
import PasswordChangeForm from '../../components/profile/PasswordChangeForm';

export default function StudentProfile() {
  const { user, updateUser } = useAuth();
  const { success: showSuccess, error: showError } = useAlert();
  
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await profileService.getProfile('aluno');
        setProfileData(data);
      } catch (error) {
        handleApiError(error, showError, 'Erro ao carregar dados do perfil');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [showError]);

  const handleProfileUpdate = async (formData) => {
    setLoading(true);
    try {
      const updatedProfile = await profileService.updateProfile(formData, 'aluno');
      setProfileData(updatedProfile);
      
      // Atualizar contexto de autenticação se necessário
      if (updateUser) {
        updateUser(updatedProfile);
      }
      
      showSuccess('Perfil atualizado com sucesso!');
    } catch (error) {
      handleApiError(error, showError, 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    setPasswordLoading(true);
    try {
      await profileService.changePassword(passwordData, 'aluno');
      showSuccess('Senha alterada com sucesso!');
      
      // Limpar formulário
      document.getElementById('password-form').reset();
    } catch (error) {
      handleApiError(error, showError, 'Erro ao alterar senha');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Menu de abas
  const tabs = [
    { id: 'profile', label: 'Informações Pessoais', icon: HiUser },
    { id: 'password', label: 'Alterar Senha', icon: HiKey },
    { id: 'photo', label: 'Foto de Perfil', icon: HiPhotograph },
  ];

  return (
    <ProtectedRoute roleRequired="aluno">
      <Layout title="Meu Perfil | CECOR">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-semibold text-gray-900">Meu Perfil</h1>
            
            <div className="mt-2 mb-6">
              <p className="text-gray-600">
                Visualize e edite suas informações pessoais
              </p>
            </div>
            
            <div className="mt-8">
              {/* Tabs */}
              <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                  Selecione uma aba
                </label>
                <select
                  id="tabs"
                  name="tabs"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={activeTab}
                  onChange={(e) => setActiveTab(e.target.value)}
                >
                  {tabs.map((tab) => (
                    <option key={tab.id} value={tab.id}>
                      {tab.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`
                            whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                            ${activeTab === tab.id
                              ? 'border-indigo-500 text-indigo-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                          `}
                        >
                          <span className="flex items-center">
                            <Icon className="mr-2 h-5 w-5" />
                            {tab.label}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                </div>
              </div>
              
              {/* Tab Content */}
              <div className="mt-8">
                {activeTab === 'profile' && (
                  <Card title="Informações Pessoais">
                    {loading && !profileData ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : (
                      <ProfileForm
                        userData={profileData || user}
                        onSubmit={handleProfileUpdate}
                        loading={loading}
                      />
                    )}
                  </Card>
                )}
                
                {activeTab === 'password' && (
                  <Card title="Alterar Senha">
                    <PasswordChangeForm
                      onSubmit={handlePasswordChange}
                      loading={passwordLoading}
                    />
                  </Card>
                )}
                
                {activeTab === 'photo' && (
                  <Card title="Foto de Perfil">
                    <div className="py-6 text-center">
                      <p className="text-gray-500 mb-4">
                        Funcionalidade em desenvolvimento.
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}