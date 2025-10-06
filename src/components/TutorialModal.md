# TutorialModal - Documentação

O `TutorialModal` é um componente modal flexível que pode receber qualquer componente React como conteúdo. É perfeito para tutoriais, formulários, confirmações, ou qualquer conteúdo que precise ser exibido em uma sobreposição modal.

## 🚀 Características

- ✅ **Aceita componentes React** como conteúdo
- ✅ **Fundo não-clicável** que cobre toda a tela
- ✅ **Z-index alto (10000)** para ficar acima de tudo
- ✅ **Navegação entre etapas** (opcional)
- ✅ **Indicadores de progresso** (opcional)
- ✅ **Botão para pular** (opcional)
- ✅ **Responsivo** para mobile e desktop
- ✅ **Animações suaves**
- ✅ **Persistência com localStorage**

## 📝 Interface

```typescript
interface TutorialStep {
  id: number;
  title: string;
  content: ReactNode; // Qualquer componente React
  image?: string;
}

interface TutorialModalProps {
  isVisible: boolean;
  onClose: () => void;
  steps: TutorialStep[];
  currentStep: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onFinish: () => void;
  showNavigation?: boolean; // Padrão: true
  showSkip?: boolean; // Padrão: true
}
```

## 🎯 Exemplos de Uso

### 1. Tutorial Multi-Etapas (Padrão)

```tsx
const tutorialSteps = [
  {
    id: 1,
    title: "Bem-vindo",
    content: <WelcomeComponent />
  },
  {
    id: 2,
    title: "Como usar",
    content: <InstructionsComponent />
  }
];

<TutorialModal
  isVisible={showTutorial}
  onClose={() => setShowTutorial(false)}
  steps={tutorialSteps}
  currentStep={currentStep}
  onNextStep={() => setCurrentStep(currentStep + 1)}
  onPrevStep={() => setCurrentStep(currentStep - 1)}
  onFinish={() => setShowTutorial(false)}
/>
```

### 2. Modal Simples (Uma Etapa)

```tsx
<TutorialModal
  isVisible={showModal}
  onClose={() => setShowModal(false)}
  steps={[{
    id: 1,
    title: "Título do Modal",
    content: <MeuComponentePersonalizado />
  }]}
  currentStep={0}
  onNextStep={() => {}}
  onPrevStep={() => {}}
  onFinish={() => setShowModal(false)}
  showNavigation={false} // Remove navegação
  showSkip={false} // Remove botão pular
/>
```

### 3. Modal com Formulário

```tsx
const FormComponent = () => {
  const [name, setName] = useState('');
  
  return (
    <form>
      <input 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
      />
      <button type="submit">Enviar</button>
    </form>
  );
};

<TutorialModal
  isVisible={showForm}
  onClose={() => setShowForm(false)}
  steps={[{
    id: 1,
    title: "Preencha o Formulário",
    content: <FormComponent />
  }]}
  // ... outras props
/>
```

### 4. Modal com Conteúdo Misto

```tsx
const MixedContent = () => (
  <div>
    <p>Texto explicativo...</p>
    <img src="/imagem.jpg" alt="Exemplo" />
    <button onClick={() => alert('Clicou!')}>
      Botão Interativo
    </button>
  </div>
);
```

## 🎨 Customização de Estilo

O modal usa CSS classes que podem ser sobrescritas:

```css
.tutorial-modal-overlay {
  /* Fundo do modal */
}

.tutorial-modal-container {
  /* Container principal */
}

.tutorial-modal-content {
  /* Área de conteúdo */
}

.tutorial-modal-footer {
  /* Rodapé com navegação */
}
```

## 🔧 Configurações Avançadas

### Persistência com localStorage

```tsx
const [showTutorial, setShowTutorial] = useState(() => {
  const hasSeenTutorial = localStorage.getItem('meu-tutorial-visto');
  return !hasSeenTutorial;
});

const handleFinish = () => {
  setShowTutorial(false);
  localStorage.setItem('meu-tutorial-visto', 'true');
};
```

### Modal com Diferentes Tamanhos

```tsx
// No seu CSS personalizado
.tutorial-modal-container.large {
  max-width: 900px;
}

.tutorial-modal-container.small {
  max-width: 400px;
}
```

## 📱 Responsividade

O modal é automaticamente responsivo, mas você pode personalizar para diferentes breakpoints no CSS.

## ⌨️ Acessibilidade

- Suporte a navegação por teclado
- ARIA labels apropriados
- Foco gerenciado automaticamente
- Screen reader friendly

## 🎯 Casos de Uso Comuns

1. **Onboarding/Tutorial** - Guiar usuários através de funcionalidades
2. **Formulários** - Capturar dados em overlay
3. **Confirmações** - Confirmar ações importantes
4. **Detalhes** - Mostrar informações detalhadas
5. **Media** - Exibir imagens/vídeos em full screen
6. **Configurações** - Painéis de configuração temporários

## 🔧 Dicas de Performance

- Use `React.memo()` para componentes de conteúdo pesados
- Lazy loading para componentes complexos:

```tsx
const HeavyComponent = React.lazy(() => import('./HeavyComponent'));

const content = (
  <Suspense fallback={<div>Carregando...</div>}>
    <HeavyComponent />
  </Suspense>
);
```

## 🎨 Temas

Você pode criar diferentes temas sobrescrevendo as variáveis CSS:

```css
.tutorial-modal-overlay.dark-theme {
  --modal-bg: #1a1a1a;
  --modal-text: #ffffff;
  --modal-border: #333333;
}
```