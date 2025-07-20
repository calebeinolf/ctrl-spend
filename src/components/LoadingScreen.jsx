const LoadingScreen = () => {
  return (
    <div className="min-h-screen md-surface flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 md-spinner"></div>
        <h2 className="md-headline-small mb-2">Budget Buddy</h2>
        <p
          className="md-body-large"
          style={{ color: "var(--md-on-surface-variant)" }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
