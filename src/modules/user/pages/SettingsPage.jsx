import { SectionTitle, ProfileCard } from '../components/shared/index.js';
import { ProfileForm, PrivacyPreferences } from '../components/settings/index.js';
import { useSettings } from '../hooks/useSettings.js';
import '../styles/profileSettings.css';

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
    </div>
  );
};