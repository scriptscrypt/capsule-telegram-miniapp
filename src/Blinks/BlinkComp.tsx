import { Action, useAction } from "@dialectlabs/blinks";
// import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import "@dialectlabs/blinks/index.css";
import { useEffect, useState } from "react";
import { Blink as DynamicBlink } from "@dialectlabs/blinks";
import { Spinner } from "../components/ui/spinner";
import useCustomAdapter from "../Blinks/components/hooks/useCustomAdapter";

// Testing Blinks Support
const BlinkComp = ({ propActionApiUrl }: { propActionApiUrl: string }) => {
  const [action, setAction] = useState<Action | null>(null);

  const { customCapsuleAdapter } = useCustomAdapter();
  // const envHeliusRpcUrl =
  //   "https://devnet.helius-rpc.com/?api-key=65e4e99e-1d60-4bb3-85ec-3219ecc8e376";
  // const actionApiUrl =
  //   "https://blinktochat.fun/api/actions/start/-1002200926307/59qiJZ4y4hdog6LnQVqbwP8U11vFnYuhq54ScmLzwSqJ";

  const actionApiUrl = propActionApiUrl;
  // const { adapter } = useActionSolanaWalletAdapter(envHeliusRpcUrl as string);
  // const adapter = capsuleClient?.currentExternalWalletAddresses as any;
  // const adapter = capsuleClient?.currentWalletIds as any;
  // useAction initiates registry, adapter and fetches the action.

  const { action: actionUrl } = useAction({
    url: actionApiUrl,
    adapter: customCapsuleAdapter,
  });

  useEffect(() => {
    console.log("actionUrl", actionUrl);
    if (actionUrl) {
      setAction(actionUrl as Action);
    }
  }, [actionUrl]);

  return (
    <>
      {action ? (
        <DynamicBlink
          // stylePreset="custom"
          action={action}
          websiteText={new URL(actionApiUrl).hostname}
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            <Spinner />
          </div>
        </>
      )}
    </>
  );
};

export default BlinkComp;
