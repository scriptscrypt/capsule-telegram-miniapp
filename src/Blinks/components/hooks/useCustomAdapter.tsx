// Just for testing on Prod :
// @ts-nocheck
import { ActionAdapterMetadata, ActionContext } from "@dialectlabs/blinks";
import capsuleClient from "../../../lib/capsuleClient";
import useCustomCapsule from "./useCustomCapsuleVars";

// interface UseCustomActionOptions {
//   url: string | URL;
//   adapter: CustomCapsuleActionAdapter;
//   securityRegistryRefreshInterval?: number;
//   supportStrategy?: ActionSupportStrategy;
// }

function useCustomAdapter() {
  const { walletId, address } = useCustomCapsule();
  // Types: interface
  interface CustomCapsuleActionAdapter {
    metadata: ActionAdapterMetadata;
    connect: (context: ActionContext) => Promise<string | null>;
    signTransaction: (
      tx: string,
      context: ActionContext
    ) => Promise<
      | {
          signature: string;
        }
      | {
          error: string;
        }
    >;
    confirmTransaction: (
      signature: string,
      context: ActionContext
    ) => Promise<void>;
    signMessage: (
      data: string,
      context: ActionContext
    ) => Promise<
      | {
          signature: string;
        }
      | {
          error: string;
        }
    >;
  }

  const customCapsuleAdapter: CustomCapsuleActionAdapter = {
    metadata: {
      supportedBlockchainIds: [
        "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
        "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
      ], // Add supported blockchain IDs here
    },
    connect: async (context: ActionContext): Promise<string | null> => {
      // Implement connection logic here

      // Return the connected address or null if connection fails
      // For the demo, I'm using the address since initializeApp() connects and creates a wallet
      return address || null;
    },
    signTransaction: async (
      tx: string,
      context: ActionContext
    ): Promise<{ signature: string } | { error: string }> => {
      try {
        //TODO : Implement transaction signing logic here

        const constructedSig = await capsuleClient?.sendTransaction(
          walletId || "",
          tx,
          "102"
        );

        const sig = constructedSig?.toString();

        return { signature: sig };
      } catch (error) {
        return { error: (error as string) || "Failed to sign transaction" };
      }
    },
    confirmTransaction: async (
      signature: string,
      context: ActionContext
    ): Promise<void> => {
      //TODO : Implement transaction confirmation logic here
    },
    signMessage: async (
      // data: string | SignMessageData$1,
      data: string,
      context: ActionContext
    ): Promise<{ signature: string } | { error: string }> => {
      try {
        //TODO :  Implement message signing logic here

        const signature = ""; // Replace with actual signature
        return { signature };
      } catch (error) {
        return { error: (error as string) || "Failed to sign message" };
      }
    },
  };
  return {
    customCapsuleAdapter,
  };
}

export default useCustomAdapter;
