import WalletConnect from "./components/WalletConnect";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="max-w-md w-full">
        <WalletConnect />
      </div>
    </div>
  );
}
