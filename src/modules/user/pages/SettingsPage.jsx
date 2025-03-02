import { SectionTitle, ProfileCard } from '../components/shared/index.js';
import { ProfileForm, PasswordForm, PrivacyPreferences } from '../components/settings/index.js';
import { useSettings } from '../hooks/useSettings.js';
import '../styles/profileSettings.css';

/**
 * SettingsPage - Página refactorizada para gestionar configuración del perfil
 * Implementa un enfoque modular con componentes y hooks personalizados
 */
export const SettingsPage = () => {
  // Utilizamos el hook personalizado para manejar toda la lógica
  const {
    profileData,
    passwordData,
    profileMessage,
    passwordMessage,
    photoURL,
    handleProfileChange,
    handlePasswordChange,
    handleProfileSubmit,
    handlePasswordSubmit
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
          handleProfileChange={handleProfileChange}
          handleProfileSubmit={handleProfileSubmit}
        />
      </ProfileCard>

      {/* Cambio de contraseña */}
      <ProfileCard title="Cambiar Contraseña">
        <PasswordForm
          passwordData={passwordData}
          passwordMessage={passwordMessage}
          handlePasswordChange={handlePasswordChange}
          handlePasswordSubmit={handlePasswordSubmit}
        />
      </ProfileCard>

      {/* Preferencias de privacidad */}
      <ProfileCard title="Preferencias">
        <PrivacyPreferences />
      </ProfileCard>
    </div>
  );
};