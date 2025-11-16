import React from 'react';
import { V0WalletConnect, V0WalletSwitcher, V0WalletInfo, V0WalletList } from '../index';

/**
 * Story fixtures for V0 Wallet Components
 * These demonstrate the components with various states and configurations
 */

export const V0WalletStory: React.FC = () => {
  return (
    <div className="p-8 space-y-8 bg-slate-900 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white mb-8">V0 Wallet Components</h1>
        
        {/* Wallet Connect Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Wallet Connect</h2>
          <div className="p-6 bg-slate-800 rounded-lg">
            <V0WalletConnect />
          </div>
        </section>

        {/* Wallet Switcher Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Wallet Switcher</h2>
          <div className="p-6 bg-slate-800 rounded-lg">
            <V0WalletSwitcher 
              onAddWallet={() => console.log('Add wallet clicked')}
              onManageGroups={() => console.log('Manage groups clicked')}
              onWalletSettings={(id) => console.log('Settings for wallet:', id)}
            />
          </div>
        </section>

        {/* Wallet Info Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Wallet Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Full View</h3>
              <V0WalletInfo showPerformance={true} />
            </div>
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Compact View</h3>
              <V0WalletInfo compact={true} />
            </div>
          </div>
        </section>

        {/* Wallet List Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Wallet List</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Full List</h3>
              <V0WalletList 
                showPerformance={true}
                onAddWallet={() => console.log('Add wallet clicked')}
                onWalletSelect={(id) => console.log('Wallet selected:', id)}
                onWalletSettings={(id) => console.log('Settings for wallet:', id)}
              />
            </div>
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Compact List</h3>
              <V0WalletList 
                compact={true}
                showBalances={true}
                onWalletSelect={(id) => console.log('Wallet selected:', id)}
              />
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Usage Examples</h2>
          <div className="space-y-6">
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Quick Connect Bar</h3>
              <div className="flex items-center gap-4">
                <V0WalletConnect />
                <V0WalletSwitcher />
              </div>
            </div>
            
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-lg font-medium text-white mb-4">Dashboard Layout</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <V0WalletList showPerformance={true} />
                </div>
                <div>
                  <V0WalletInfo showPerformance={true} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

/**
 * Individual component examples for testing
 */
export const V0WalletConnectExample: React.FC = () => (
  <div className="p-6 bg-slate-800 rounded-lg">
    <V0WalletConnect />
  </div>
);

export const V0WalletSwitcherExample: React.FC = () => (
  <div className="p-6 bg-slate-800 rounded-lg">
    <V0WalletSwitcher />
  </div>
);

export const V0WalletInfoExample: React.FC = () => (
  <div className="p-6 bg-slate-800 rounded-lg">
    <V0WalletInfo showPerformance={true} />
  </div>
);

export const V0WalletListExample: React.FC = () => (
  <div className="p-6 bg-slate-800 rounded-lg">
    <V0WalletList showPerformance={true} />
  </div>
);

/**
 * Error states and edge cases
 */
export const V0WalletErrorStates: React.FC = () => (
  <div className="p-8 space-y-8 bg-slate-900 min-h-screen">
    <h1 className="text-2xl font-bold text-white mb-8">Error States</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 bg-slate-800 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">No Wallets</h3>
        <V0WalletList />
      </div>
      
      <div className="p-6 bg-slate-800 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">No Active Wallet</h3>
        <V0WalletInfo />
      </div>
    </div>
  </div>
);

export default V0WalletStory;