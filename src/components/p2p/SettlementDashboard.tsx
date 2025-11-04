import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';

interface Settlement {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  parties: {
    buyer: string;
    seller: string;
  };
}

export function SettlementDashboard() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - in real implementation, this would fetch from backend
    const mockSettlements: Settlement[] = [
      {
        id: '1',
        amount: 1000,
        currency: 'USDC',
        status: 'completed',
        timestamp: new Date(),
        parties: {
          buyer: '0x1234...5678',
          seller: '0xabcd...efgh'
        }
      }
    ];
    
    setSettlements(mockSettlements);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settlements.map((settlement) => (
            <div key={settlement.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{settlement.amount} {settlement.currency}</p>
                  <p className="text-sm text-gray-500">
                    {settlement.parties.buyer} → {settlement.parties.seller}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    settlement.status === 'completed' ? 'bg-green-100 text-green-800' :
                    settlement.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {settlement.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {settlement.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {settlements.length === 0 && (
            <p className="text-center text-gray-500 py-8">No settlements found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
