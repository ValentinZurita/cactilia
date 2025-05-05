import { SectionTitle, ProfileCard } from '../components/shared/index.js';
import { ProfileForm, PrivacyPreferences } from '../components/settings/index.js';
import { useSettings } from '../hooks/useSettings.js';
import '../styles/profileSettings.css';
import { useDispatch } from 'react-redux';
import { startLogout } from '../../../store/auth/authThunks.js';

/**
 * SettingsPage - Página refactorizada para gestionar configuración del perfil
 * Implementa un enfoque modular con componentes simplificado
 */
export const SettingsPage = () => {
  // Utilizamos el hook personalizado para manejar toda la lógica
  const {
    profileData,
    profileMessage,
    photoURL,
    selectedPhoto,
    profileLoading,
    photoLoading,
    handleProfileChange,
    handleProfileSubmit,
    handlePhotoChange,
    handlePhotoUpload
  } = useSettings();

  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(startLogout());
  };

  return (
    <div>
      {/* Título de sección */}
      <SectionTitle title="Configuración de Cuenta" />

      {/* Perfil de usuario */}
      <ProfileCard title="Información Personal">
        <ProfileForm
          profileData={profileData}
          profileMessage={profileMessage}
          photoURL={photoURL}
          profileLoading={profileLoading}
          photoLoading={photoLoading}
          selectedPhoto={selectedPhoto}
          handleProfileChange={handleProfileChange}
          handleProfileSubmit={handleProfileSubmit}
          handlePhotoChange={handlePhotoChange}
          handlePhotoUpload={handlePhotoUpload}
        />
      </ProfileCard>

      {/* Preferencias - simplificadas */}
      <ProfileCard title="Preferencias">
        <PrivacyPreferences />
      </ProfileCard>

      {/* Botón de Cerrar Sesión - Fuera de ProfileCard */}
      <div className="d-grid gap-2 mt-3 mb-3">
        <button
          className="btn btn-link text-danger text-decoration-none"
          type="button"
          onClick={handleLogout}
        >
          <i className="bi bi-box-arrow-right me-2"></i>
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
};