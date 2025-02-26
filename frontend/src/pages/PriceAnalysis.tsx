import React from 'react';
import { Layout } from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import brain from 'brain';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export default function PriceAnalysis() {
  const [loading, setLoading] = React.useState(false);
  const [keywords, setKeywords] = React.useState('');
  const [analysis, setAnalysis] = React.useState<any>(null);

  const handleAnalyze = async () => {
    if (!keywords.trim()) {
      toast.error('Please enter keywords to analyze');
      return;
    }

    setLoading(true);
    try {
      const response = await brain.analyze_price({
        body: { keywords: keywords.trim() }
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Price Analysis</h1>
        </div>

        {/* Search Form */}
        <Card className="p-6">
          <div className="flex gap-4">
            <Input
              placeholder="Enter product keywords..."
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
              className="flex-1"
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>
        </Card>

        {analysis && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Price Summary */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Price Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Suggested Price</p>
                  <p className="text-2xl font-bold">${analysis.suggested_price}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Confidence Score</p>
                  <p className="text-2xl font-bold">{(analysis.confidence_score * 100).toFixed(0)}%</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Price Range</p>
                  <p className="text-2xl font-bold">${analysis.price_range.min} - ${analysis.price_range.max}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg">
                  <p className="text-sm text-gray-400">Best Time to List</p>
                  <p className="text-2xl font-bold">{analysis.best_day_to_list}</p>
                  <p className="text-sm text-gray-400">{analysis.best_time_to_list}</p>
                </div>
              </div>
            </Card>

            {/* Market Trends */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Market Trends</h2>
              <div className="space-y-4">
                {analysis.market_trends.map((trend: any) => (
                  <div key={trend.period} className="p-4 bg-gray-900 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-400 capitalize">{trend.period}ly Average</p>
                        <p className="text-xl font-bold">${trend.average_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Price Change</p>
                        <p className={`text-xl font-bold ${trend.price_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {trend.price_change >= 0 ? '+' : ''}{trend.price_change}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Price History Chart */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-6">Price History</h2>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analysis.price_history}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      formatter={(value: any) => [`$${value}`, 'Price']}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Competitor Analysis */}
            <Card className="p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold mb-6">Active Competitors</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-2">Title</th>
                      <th className="text-left py-2">Price</th>
                      <th className="text-left py-2">Platform</th>
                      <th className="text-left py-2">Condition</th>
                      <th className="text-left py-2">Listed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.active_competitors.map((competitor: any, index: number) => (
                      <tr key={index} className="border-b border-gray-800">
                        <td className="py-2">
                          <a
                            href={competitor.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400"
                          >
                            {competitor.title}
                          </a>
                        </td>
                        <td className="py-2">${competitor.price}</td>
                        <td className="py-2">{competitor.platform}</td>
                        <td className="py-2">{competitor.condition}</td>
                        <td className="py-2">{new Date(competitor.date_listed).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
