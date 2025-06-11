"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import type React from "react";

import { useState, useEffect } from "react";
import { useCreateUserMutation } from "./state/api";
import { useRouter, usePathname } from "next/navigation";
import ConditionalDashboardWrapper from "./ConditionalDashboardWrapper";

const LoadingIndicator = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-violet-600 motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-violet-400"></div>
      <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">
        Initialisation de votre profil...
      </p>
    </div>
  </div>
);

const ErrorIndicator = ({
  error,
  onRetry,
}: {
  error: any;
  onRetry: () => void;
}) => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="max-w-md rounded-lg bg-white p-6 text-center shadow-lg dark:bg-gray-800">
      <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
        Erreur de synchronisation
      </h2>
      <p className="mb-4 text-gray-700 dark:text-gray-300">
        Une erreur est survenue lors de la création de votre profil. Veuillez
        réessayer.
      </p>
      <div className="space-y-2">
        <button
          onClick={onRetry}
          className="w-full rounded bg-violet-600 px-4 py-2 text-white hover:bg-violet-700"
        >
          Réessayer
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full rounded border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Recharger la page
        </button>
      </div>
      {process.env.NODE_ENV === "development" && (
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Détails de l'erreur
          </summary>
          <pre className="mt-2 overflow-auto text-xs text-gray-600">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export default function AuthWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [createUser, { error, isLoading: apiLoading }] =
    useCreateUserMutation();
  const [isUserCreated, setIsUserCreated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [showError, setShowError] = useState(false);

  // Fonction pour créer/synchroniser l'utilisateur
  const createUserProfile = async () => {
    if (!user) return;

    const userData = {
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName ?? "",
      clerkUserId: user.id,
      profilePictureUrl: user.imageUrl,
    };

    console.log("Envoi des données à l'API Laravel :", userData);

    try {
      const response = await createUser(userData).unwrap();
      console.log("Réponse de l'API Laravel :", response);

      // Vérifier si la réponse indique un succès
      if (response.success !== false) {
        setIsUserCreated(true);
        setShowError(false);

        // Stocker l'ID utilisateur Clerk dans le localStorage
        localStorage.setItem("clerkUserId", user.id);

        // Stockage du rôle global renvoyé par l'API
        if (response?.user?.role) {
          setUserRole(response.user.role);
          // Stocker uniquement le rôle global (admin)
          if (response.user.role === "admin") {
            localStorage.setItem("userGlobalRole", response.user.role);
          }
        } else {
          // Rôle par défaut si non spécifié
          setUserRole("user");
        }
      } else {
        throw new Error(
          response.message || "Erreur lors de la création de l'utilisateur",
        );
      }
    } catch (err: any) {
      console.error("Erreur API Laravel :", err);

      // Vérifier si c'est une erreur de réseau ou serveur
      const isNetworkError = !err.status || err.status >= 500;
      const isValidationError = err.status === 422;

      if (isValidationError) {
        console.error("Erreur de validation:", err.data?.errors);
        setShowError(true);
        return;
      }

      // Incrémenter le compteur de tentatives pour les erreurs réseau/serveur
      if (isNetworkError) {
        setRetryCount((prev) => prev + 1);

        // Afficher l'erreur après 2 tentatives échouées
        if (retryCount >= 1) {
          setShowError(true);
        } else {
          // Réessayer automatiquement après un délai
          setTimeout(() => {
            createUserProfile();
          }, 2000);
        }
      } else {
        // Pour les autres erreurs, continuer avec un rôle par défaut
        console.warn("Erreur non critique, continuation avec rôle par défaut");
        setIsUserCreated(true);
        setUserRole("user");
        localStorage.setItem("clerkUserId", user.id);
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setShowError(false);
    createUserProfile();
  };

  // Création de l'utilisateur dans l'API backend et récupération du rôle
  useEffect(() => {
    if (
      authLoaded &&
      userLoaded &&
      isSignedIn &&
      user &&
      !isUserCreated &&
      !showError
    ) {
      createUserProfile();
    }
  }, [authLoaded, userLoaded, isSignedIn, user, isUserCreated, showError]);

  // Redirections en fonction du rôle et de l'URL en cours
  useEffect(() => {
    if (!userRole) return; // On attend la détermination du rôle

    // Si l'utilisateur est admin et que le pathname ne commence pas par "/admin/apk", on le redirige vers "/admin/apk"
    if (userRole === "admin" && !pathname.startsWith("/admin/apk")) {
      router.push("/admin/apk");
    }

    // Si l'utilisateur n'est pas admin et tente d'accéder à une route admin, on le redirige (ici vers "/landing")
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      router.push("/landing");
    }
  }, [userRole, pathname, router]);

  // États de chargement et d'erreur
  if (!authLoaded || !userLoaded) {
    return <LoadingIndicator />;
  }

  if (isSignedIn && !isUserCreated) {
    if (showError) {
      return <ErrorIndicator error={error} onRetry={handleRetry} />;
    }
    if (apiLoading || retryCount > 0) {
      return <LoadingIndicator />;
    }
  }

  return isSignedIn ? (
    <ConditionalDashboardWrapper>{children}</ConditionalDashboardWrapper>
  ) : (
    <>{children}</>
  );
}
