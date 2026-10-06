interface GoogleCredentialResponse {
  credential: string;
}

interface Window {
  google?: {
    accounts: {
      id: {
        initialize: (options: {
          client_id: string;
          callback: (response: GoogleCredentialResponse) => void;
          auto_select?: boolean;
        }) => void;
        renderButton: (
          parent: HTMLElement,
          options: { theme: string; size: string; text: string; width: number; locale: string },
        ) => void;
        disableAutoSelect: () => void;
      };
    };
  };
}
