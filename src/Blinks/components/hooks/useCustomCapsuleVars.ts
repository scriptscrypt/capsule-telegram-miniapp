import { useState } from "react";

import WebApp from "@twa-dev/sdk";
import { WalletType } from "@usecapsule/web-sdk";
import { useEffect } from "react";
import capsuleClient from "../../../lib/capsuleClient";
import {
    clearChunkedStorage,
    ErrorHandler,
    LogFunction,
    retrieveChunkedData,
    storeWithChunking,
} from "../../../lib/cloudStorageUtil";

const useCustomCapsuleVars = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [walletId, setWalletId] = useState<string | null>(null);
    const [address, setAddress] = useState<string | undefined>("");
    const [userShare, setUserShare] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [logs, setLogs] = useState<Array<{ message: string; type: "info" | "error" | "success" }>>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingText, setLoadingText] = useState("");
    const [isStorageComplete, setIsStorageComplete] = useState(false);

    useEffect(() => {
        initializeApp();
    }, []);

    const initializeApp = async () => {
        setIsLoading(true);
        setLoadingText("Initializing Capsule Telegram Mini App Demo...");

        try {
            WebApp.ready();

            if (!WebApp.initDataUnsafe.user) {
                throw new Error("No User found. Please open App from Telegram");
            }

            log(`User authenticated: ${WebApp.initDataUnsafe.user.username}`, "success");
            setIsAuthenticated(true);
            setLoadingText(
                `Checking ${WebApp.initDataUnsafe.user.username}'s telegram cloud storage for existing wallet data...`
            );
            const userShare = await retrieveChunkedData("userShare", log, handleError);
            const walletId = await retrieveChunkedData("walletId", log, handleError);

            if (userShare && walletId) {
                setUserShare(userShare);
                setWalletId(walletId);
                setIsStorageComplete(true);
                log(`Wallet data found: ${walletId}`, "success");
                await capsuleClient.setUserShare(userShare);
            } else {
                log(`No existing wallet data found for user ${WebApp.initDataUnsafe.user.username}`, "info");
            }
        } catch (error) {
            handleError(`Initialization error: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    const log: LogFunction = (message, type) => {
        setLogs((prevLogs) => [...prevLogs, { message, type }]);
    };

    const handleError: ErrorHandler = (errorMessage) => log(errorMessage, "error");

    const generateWallet = async (): Promise<void> => {
        setIsLoading(true);
        setLoadingText("Generating a new wallet...");
        try {
            const username = WebApp.initDataUnsafe.user?.username;
            if (!username) throw new Error("Username not found");

            const pregenWallet = await capsuleClient.createWalletPreGen(
                WalletType.EVM,
                `${username + crypto.randomUUID().split("-")[0]}@test.usecapsule.com`
            );

            log(`Wallet created with ID: ${pregenWallet.id} and Address: ${pregenWallet.address || "N/A"}`, "success");

            const share = (await capsuleClient.getUserShare()) || "";

            // Update state immediately
            setUserShare(share);
            setAddress(pregenWallet.address);
            setWalletId(pregenWallet.id);

            // Start asynchronous storage operations
            log("Storing the wallet data in users telegram cloud storage...", "info");
            log("This may take a few seconds. The wallet is now usable, but please DO NOT close the mini-app while this is in progress", "info");

            Promise.all([
                storeWithChunking("userShare", share, log, handleError),
                storeWithChunking("walletId", pregenWallet.id, log, handleError),
            ])
                .then(() => {
                    log("Wallet data stored successfully", "success");
                    setIsStorageComplete(true);
                })
                .catch((error) => {
                    handleError(`Error storing wallet data: ${error instanceof Error ? error.message : String(error)}`);
                    setIsStorageComplete(true);
                });
        } catch (error) {
            handleError(`Error generating wallet: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            setLoadingText("");
        }
    };
    const signMessage = async () => {
        if (!walletId || !userShare) {
            handleError("Wallet ID or User Share not available to sign message");
            return;
        }

        setIsLoading(true);
        setLoadingText(`Signing message "${message}"...`);
        try {
            await capsuleClient.setUserShare(userShare);
            const messageBase64 = btoa(message);
            const sig = await capsuleClient.signMessage(walletId, messageBase64);

            if ("transactionReviewUrl" in sig) {
                throw new Error(`Error: Transaction review required: ${sig.transactionReviewUrl}`);
            }
            setSignature(sig.signature);
            log(`Message signed successfully`, "success");
        } catch (error) {
            handleError(`Error signing message: ${error}`);
        } finally {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    const clearStorage = async () => {
        setIsLoading(true);
        setLoadingText("Clearing storage and resetting state...");
        try {
            await clearChunkedStorage(log, handleError);
            setUserShare(null);
            setWalletId(null);
            setIsStorageComplete(false);
            log("Finished clearing storage and resetting state", "success");
        } catch (error) {
            handleError(`Error clearing storage: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
            setLoadingText("");
        }
    };

    const logout = () => {
        log("Logging out...", "info");
        WebApp.close();
    };


    return {
        isAuthenticated, setIsAuthenticated,
        walletId, setWalletId,
        address, setAddress,
        userShare, setUserShare,
        message, setMessage,
        signature, setSignature,
        logs, setLogs,
        showLogs, setShowLogs,
        isLoading, setIsLoading,
        loadingText, setLoadingText,
        isStorageComplete, setIsStorageComplete,

        logout,
        clearStorage,
        signMessage,
        generateWallet

    };
}

export default useCustomCapsuleVars;