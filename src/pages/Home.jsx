import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen md-surface">
      {/* Header */}
      <header
        className="md-surface border-b px-6 py-4"
        style={{ borderColor: "var(--md-outline-variant)" }}
      >
        <div className="flex items-center justify-between">
          <h1 className="md-headline-medium">Budget Buddy</h1>
          <button onClick={handleLogout} className="md-btn-text">
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8">
        <div className="max-w-sm mx-auto">
          {/* Welcome Card */}
          <div className="md-card mb-6">
            <div className="text-center">
              <h2 className="md-headline-small mb-2">
                Welcome back, {user?.displayName || "User"}!
              </h2>
              <p
                className="md-body-large"
                style={{ color: "var(--md-on-surface-variant)" }}
              >
                Ready to manage your budget?
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <div className="md-card">
              <div className="text-center py-8">
                <div
                  className="mx-auto w-16 h-16 rounded-full mb-4 flex items-center justify-center"
                  style={{ backgroundColor: "var(--md-primary-container)" }}
                >
                  <svg
                    className="w-8 h-8"
                    style={{ color: "var(--md-on-primary-container)" }}
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <h3 className="md-headline-small mb-2">You're all set!</h3>
                <p
                  className="md-body-medium mb-4"
                  style={{ color: "var(--md-on-surface-variant)" }}
                >
                  Your authentication is working perfectly. The budget features
                  will be added next.
                </p>
                <button className="md-btn-filled">Start budgeting</button>
              </div>
            </div>

            {/* User Info Card */}
            <div className="md-card">
              <h3 className="md-headline-small mb-4">Account Info</h3>
              <div className="space-y-3">
                <div>
                  <span
                    className="md-label-large block"
                    style={{ color: "var(--md-on-surface-variant)" }}
                  >
                    Email
                  </span>
                  <span className="md-body-large">{user?.email}</span>
                </div>
                {user?.displayName && (
                  <div>
                    <span
                      className="md-label-large block"
                      style={{ color: "var(--md-on-surface-variant)" }}
                    >
                      Name
                    </span>
                    <span className="md-body-large">{user.displayName}</span>
                  </div>
                )}
                <div>
                  <span
                    className="md-label-large block"
                    style={{ color: "var(--md-on-surface-variant)" }}
                  >
                    Member since
                  </span>
                  <span className="md-body-large">
                    {user?.metadata?.creationTime
                      ? new Date(
                          user.metadata.creationTime
                        ).toLocaleDateString()
                      : "Unknown"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
