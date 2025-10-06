import React from 'react';

// Componente de exemplo para modal simples (sem navegação)
export const SimpleModalContent: React.FC = () => {
    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                🚀
            </div>
            <h2 style={{ color: '#3b82f6', marginBottom: '16px' }}>
                Modal Personalizado!
            </h2>
            <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                Este é um exemplo de como você pode usar o modal com qualquer componente React.
                Você pode colocar <strong>formulários</strong>, <em>imagens</em>, botões interativos,
                ou qualquer outro conteúdo personalizado aqui.
            </p>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
            }}>
                <div style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(59, 130, 246, 0.3)'
                }}>
                    <h4 style={{ color: '#3b82f6', margin: '0 0 8px 0' }}>Flexível</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                        Aceita qualquer componente React
                    </p>
                </div>

                <div style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(16, 185, 129, 0.3)'
                }}>
                    <h4 style={{ color: '#10b981', margin: '0 0 8px 0' }}>Responsivo</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                        Funciona em desktop e mobile
                    </p>
                </div>

                <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                    <h4 style={{ color: '#f59e0b', margin: '0 0 8px 0' }}>Customizável</h4>
                    <p style={{ margin: 0, fontSize: '14px' }}>
                        CSS e comportamento personalizáveis
                    </p>
                </div>
            </div>

            <div style={{
                background: 'rgba(236, 72, 153, 0.1)',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid rgba(236, 72, 153, 0.3)'
            }}>
                <h3 style={{ color: '#ec4899', margin: '0 0 12px 0' }}>
                    🎯 Como usar
                </h3>
                <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: '8px 0' }}>
                        1. Crie seus componentes React personalizados
                    </p>
                    <p style={{ margin: '8px 0' }}>
                        2. Passe-os como <code style={{
                            background: 'rgba(0, 0, 0, 0.3)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                        }}>content</code> nos steps
                    </p>
                    <p style={{ margin: '8px 0' }}>
                        3. Configure navegação, pular, etc. conforme necessário
                    </p>
                </div>
            </div>
        </div>
    );
};

// Componente para demonstrar formulário no modal
export const FormModalContent: React.FC = () => {
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>
                    ✅
                </div>
                <h2 style={{ color: '#10b981', marginBottom: '16px' }}>
                    Formulário Enviado!
                </h2>
                <p>
                    Obrigado, <strong>{name}</strong>! Seu email <strong>{email}</strong> foi registrado.
                </p>
                <button
                    onClick={() => setSubmitted(false)}
                    style={{
                        background: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '16px'
                    }}
                >
                    Enviar Novamente
                </button>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#3b82f6', marginBottom: '16px', textAlign: 'center' }}>
                📝 Exemplo de Formulário
            </h2>
            <p style={{ marginBottom: '20px', textAlign: 'center' }}>
                Este modal contém um formulário interativo totalmente funcional:
            </p>

            <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        Nome:
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'inherit',
                            fontSize: '16px'
                        }}
                        placeholder="Digite seu nome"
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>
                        Email:
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '6px',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: 'inherit',
                            fontSize: '16px'
                        }}
                        placeholder="Digite seu email"
                    />
                </div>

                <button
                    type="submit"
                    style={{
                        width: '100%',
                        background: '#10b981',
                        color: 'white',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '6px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                    }}
                >
                    Enviar Formulário
                </button>
            </form>
        </div>
    );
};

export default {
    SimpleModalContent,
    FormModalContent
};