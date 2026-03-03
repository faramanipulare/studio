
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import { 
  LayoutDashboard, 
  History, 
  PlusCircle, 
  TrendingUp, 
  TrendingDown, 
  LogOut,
  Calendar as CalendarIcon,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTrade, setNewTrade] = useState({
    date: new Date().toISOString().split('T')[0],
    asset: '',
    type: 'Buy',
    entry_price: '',
    exit_price: '',
    status: 'Open'
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const response = await fetch('/api/trades');
      const data = await response.json();
      setTrades(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching trades:', error);
      setLoading(false);
    }
  };

  const handleAddTrade = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newTrade,
          entry_price: parseFloat(newTrade.entry_price),
          exit_price: newTrade.exit_price ? parseFloat(newTrade.exit_price) : null,
          user_id: 1 // Hardcoded for demo
        }),
      });
      if (response.ok) {
        fetchTrades();
        setNewTrade({
          date: new Date().toISOString().split('T')[0],
          asset: '',
          type: 'Buy',
          entry_price: '',
          exit_price: '',
          status: 'Open'
        });
        setActiveTab('history');
      }
    } catch (error) {
      console.error('Error adding trade:', error);
    }
  };

  const stats = useMemo(() => {
    const closedTrades = trades.filter(t => t.status === 'Closed');
    const totalPnL = closedTrades.reduce((acc, t) => acc + t.pnl, 0);
    const winRate = closedTrades.length > 0 
      ? (closedTrades.filter(t => t.pnl > 0).length / closedTrades.length * 100).toFixed(1)
      : 0;
    return { totalPnL, winRate, totalTrades: trades.length };
  }, [trades]);

  const chartData = useMemo(() => {
    let runningPnL = 0;
    return trades
      .filter(t => t.status === 'Closed')
      .map(t => ({
        date: t.date,
        pnl: runningPnL += t.pnl
      }));
  }, [trades]);

  const SentimentBadge = ({ sentiment }) => {
    if (sentiment === 'Trade') {
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1 w-fit">
          <CheckCircle2 className="w-3 h-3" /> TRADE
        </Badge>
      );
    }
    if (sentiment === 'Avoid') {
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 flex items-center gap-1 w-fit">
          <XCircle className="w-3 h-3" /> AVOID
        </Badge>
      );
    }
    return <Badge variant="secondary">N/A</Badge>;
  };

  return (
    <div className="min-h-screen bg-[#050508] text-slate-200">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-[#0a0c12] border-r border-white/5 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Zap className="text-white w-5 h-5" />
          </div>
          <h1 className="font-black text-lg tracking-tighter">FARA MANIPULARE</h1>
        </div>
        
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-semibold text-sm">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <History size={20} />
            <span className="font-semibold text-sm">Trade History</span>
          </button>
          <button 
            onClick={() => setActiveTab('add')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'add' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <PlusCircle size={20} />
            <span className="font-semibold text-sm">Add Trade</span>
          </button>
        </nav>

        <div className="absolute bottom-6 left-6 right-6">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all group">
            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
            <span className="font-semibold text-sm">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Profit/Loss</CardDescription>
                  <CardTitle className={`text-3xl font-black ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${stats.totalPnL.toFixed(2)}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Win Rate</CardDescription>
                  <CardTitle className="text-3xl font-black text-primary">{stats.winRate}%</CardTitle>
                </CardHeader>
              </Card>
              <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
                <CardHeader className="pb-2">
                  <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Total Trades</CardDescription>
                  <CardTitle className="text-3xl font-black text-white">{stats.totalTrades}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white/70">Equity Curve</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          itemStyle={{ color: '#3b82f6' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="pnl" 
                          stroke="#3b82f6" 
                          strokeWidth={3} 
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 0 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-white/70">Trade Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trades.slice(-10)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="asset" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0a0c12', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                        />
                        <Bar dataKey="pnl" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="bg-[#0c0e14] border-white/5 shadow-xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-black tracking-tight">Trade Ledger</CardTitle>
                  <CardDescription className="text-slate-400">Detailed record of all market executions</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/5 hover:bg-transparent">
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Date</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Asset</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Type</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Entry</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Exit</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-center">Impact %</TableHead>
                      <TableHead className="text-slate-400 font-bold uppercase text-[10px] tracking-widest text-center">Sentiment</TableHead>
                      <TableHead className="text-right text-slate-400 font-bold uppercase text-[10px] tracking-widest">PnL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium py-4">{trade.date}</TableCell>
                        <TableCell className="font-bold">{trade.asset}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${trade.type === 'Buy' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {trade.type.toUpperCase()}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono text-slate-300">${trade.entry_price.toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-slate-300">{trade.exit_price ? `$${trade.exit_price.toLocaleString()}` : '-'}</TableCell>
                        <TableCell className="text-center">
                          {trade.impact_percentage ? (
                            <span className="text-xs font-mono text-slate-400">
                              {trade.impact_percentage}%
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="flex justify-center">
                          <SentimentBadge sentiment={trade.sentiment} />
                        </TableCell>
                        <TableCell className={`text-right font-mono font-bold ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'add' && (
          <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500">
            <Card className="bg-[#0c0e14] border-white/5 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-black tracking-tight">Register New Trade</CardTitle>
                <CardDescription className="text-slate-400">Input execution details for portfolio tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTrade} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Pair</Label>
                      <Input 
                        placeholder="e.g. BTC/USD" 
                        value={newTrade.asset}
                        onChange={(e) => setNewTrade({...newTrade, asset: e.target.value})}
                        className="bg-black/50 border-white/10 focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Execution Type</Label>
                      <Select 
                        value={newTrade.type} 
                        onValueChange={(v) => setNewTrade({...newTrade, type: v})}
                      >
                        <SelectTrigger className="bg-black/50 border-white/10">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a0c12] border-white/10">
                          <SelectItem value="Buy">Long / Buy</SelectItem>
                          <SelectItem value="Sell">Short / Sell</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entry Price</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        value={newTrade.entry_price}
                        onChange={(e) => setNewTrade({...newTrade, entry_price: e.target.value})}
                        className="bg-black/50 border-white/10 focus:border-primary transition-colors"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exit Price (Optional)</Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00"
                        value={newTrade.exit_price}
                        onChange={(e) => setNewTrade({...newTrade, exit_price: e.target.value})}
                        className="bg-black/50 border-white/10 focus:border-primary transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Execution Date</Label>
                    <Input 
                      type="date" 
                      value={newTrade.date}
                      onChange={(e) => setNewTrade({...newTrade, date: e.target.value})}
                      className="bg-black/50 border-white/10 focus:border-primary transition-colors"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full h-12 text-[11px] font-black uppercase tracking-[0.2em] bg-primary hover:bg-primary/80">
                    Confirm Execution
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
