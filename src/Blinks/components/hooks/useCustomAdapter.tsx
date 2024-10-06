// Just for testing on Prod :
// @ts-nocheck
import { ActionAdapterMetadata, ActionContext } from "@dialectlabs/blinks";
import capsuleClient from "../../../lib/capsuleClient";
import useCustomCapsule from "./useCustomCapsuleVars";
import { LogFunction } from "../../../lib/cloudStorageUtil";

// interface UseCustomActionOptions {
//   url: string | URL;
//   adapter: CustomCapsuleActionAdapter;
//   securityRegistryRefreshInterval?: number;
//   supportStrategy?: ActionSupportStrategy;
// }

function useCustomAdapter() {
  const { walletId, address, setLogs } = useCustomCapsule();

  const log: LogFunction = (message, type) => {
    setLogs((prevLogs) => [...prevLogs, { message, type }]);
  };

  const handleError: ErrorHandler = (errorMessage) =>
    log(errorMessage, "error");

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
      log(`${address} - connected`, "success");
      return address;
    },
    signTransaction: async (
      tx: string,
      context: ActionContext
    ): Promise<{ signature: string } | { error: string }> => {
      try {
        //TODO : Implement transaction signing logic here
        log(`Sign Tx method called`);

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
      log(`Confirm Tx method called`);
    },
    signMessage: async (
      // data: string | SignMessageData$1,
      data: string,
      context: ActionContext
    ): Promise<{ signature: string } | { error: string }> => {
      try {
        //TODO :  Implement message signing logic here

        log(`SignMessage method called`);
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
