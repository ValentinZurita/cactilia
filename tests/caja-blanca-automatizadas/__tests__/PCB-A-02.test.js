import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';

// Mock de InputField para las pruebas
const InputField = ({ label, type, placeholder, errors, ...rest }) => {
  return (
    <div>
      <label htmlFor={label}>{label}</label>
      <input id={label} type={type} placeholder={placeholder} {...rest} />
      {errors && <span role="alert">{errors.message}</span>}
    </div>
  );
};

// Componente de prueba para aislar la validación de contraseña
const PasswordValidationTest = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    mode: 'onChange' // Para validar al cambiar, no solo al enviar
  });
  
  const onSubmit = (data) => console.log(data);
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <InputField
        label="Password"
        type="password"
        placeholder="Ingresa tu contraseña"
        {...register('password', {
          required: 'La contraseña es obligatoria',
          pattern: {
            value: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/,
            message: 'Mínimo 6 carácteres, con al menos 1 letra y 1 número',
          },
        })}
        errors={errors.password}
      />
      <button type="submit">Enviar</button>
    </form>
  );
};

describe('Validación de Contraseña', () => {
  // Camino 1: Contraseña no proporcionada
  test('debe mostrar error cuando la contraseña está vacía', async () => {
    render(<PasswordValidationTest />);
  
    // Simular clic en el campo y luego salir sin escribir nada
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.click(passwordInput);
    await userEvent.tab(); // Mover foco al siguiente elemento
  
    // Verificar que aparece mensaje de error
    // Usamos waitFor para dar tiempo a que aparezca el mensaje de error
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    
    // Ahora esperar a que aparezca el mensaje de error
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('La contraseña es obligatoria');
  });

  // Camino 2: Contraseña no cumple requisitos
  test('debe mostrar error cuando la contraseña solo tiene números', async () => {
    render(<PasswordValidationTest />);
  
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, '123456');
    await userEvent.tab();
  
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Mínimo 6 carácteres, con al menos 1 letra y 1 número');
  });

  test('debe mostrar error cuando la contraseña solo tiene letras', async () => {
    render(<PasswordValidationTest />);
  
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'abcdef');
    await userEvent.tab();
  
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Mínimo 6 carácteres, con al menos 1 letra y 1 número');
  });

  test('debe mostrar error cuando la contraseña es muy corta', async () => {
    render(<PasswordValidationTest />);
  
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'a1');
    await userEvent.tab();
  
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
    const errorMessage = await screen.findByRole('alert');
    expect(errorMessage).toHaveTextContent('Mínimo 6 carácteres, con al menos 1 letra y 1 número');
  });

  // Camino 3: Contraseña válida
  test('no debe mostrar error con una contraseña válida simple', async () => {
    render(<PasswordValidationTest />);
  
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'abc123');
    await userEvent.tab();
    
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
  
    // Verificar que no hay mensaje de error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('no debe mostrar error con una contraseña válida compleja', async () => {
    render(<PasswordValidationTest />);
  
    const passwordInput = screen.getByLabelText(/password/i);
    await userEvent.type(passwordInput, 'Abc123XYZ!');
    await userEvent.tab();
    
    await userEvent.click(screen.getByRole('button', { name: /enviar/i }));
  
    // Verificar que no hay mensaje de error
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
}); 