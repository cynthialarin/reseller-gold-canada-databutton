import { useEffect, useState } from "react";
import brain from "brain";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

interface TimeSeriesPoint {
  date: string;
  value: number;
}

interface PlatformBreakdown {
  platform: string;
  value: number;
  percentage: number;
}

interface SalesByPlatform {
  platform: string;
  total_sales: number;
  total_revenue: number;
  average_price: number;
  growth_rate: number;
}

interface InventoryMetrics {
  total_items: number;
  active_listings: number;
  sold_items: number;
  average_days_to_sell: number;
  turnover_rate: number;
}

interface AnalyticsSummary {
  total_revenue: number;
  total_sales: number;
  average_price: number;
  profit_margin: number;
  platform_metrics: SalesByPlatform[];
  inventory_metrics: InventoryMetrics;
  revenue_trend: TimeSeriesPoint[];
  sales_trend: TimeSeriesPoint[];
  platform_revenue_breakdown: PlatformBreakdown[];
  top_categories: PlatformBreakdown[];
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
};

const formatPercent = (value: number) => {
  return `${value.toFixed(1)}%`;
};

const formatNumber = (value: number) => {
  return new Intl.NumberFormat("en-US").format(value);
};

const KPICard = ({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </CardContent>
  </Card>
);

const TimeSeriesChart = ({ data, dataKey = "value", color = "#0088FE" }: { data: any[]; dataKey?: string; color?: string }) => (
  <ResponsiveContainer width="100%" height={350}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
    </LineChart>
  </ResponsiveContainer>
);

const PieChartComponent = ({ data }: { data: PlatformBreakdown[] }) => (
  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
        outerRadius={80}
        fill="#8884d8"
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export default function Analytics() {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await brain.get_analytics_summary();
        const analyticsData = await response.json();
        setData(analyticsData);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return <div>Error loading analytics data</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Business Analytics</h1>

      {/* KPI Cards */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Revenue"
          value={formatCurrency(data.total_revenue)}
          subtitle={`${data.total_sales} sales`}
        />
        <KPICard
          title="Average Price"
          value={formatCurrency(data.average_price)}
        />
        <KPICard
          title="Profit Margin"
          value={formatPercent(data.profit_margin)}
        />
        <KPICard
          title="Active Listings"
          value={formatNumber(data.inventory_metrics.active_listings)}
          subtitle={`${formatNumber(data.inventory_metrics.sold_items)} sold`}
        />
      </div>

      {/* Trends */}
      <Tabs defaultValue="revenue" className="mb-8">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Trend</TabsTrigger>
          <TabsTrigger value="sales">Sales Trend</TabsTrigger>
        </TabsList>
        <TabsContent value="revenue">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data.revenue_trend} color="#0088FE" />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSeriesChart data={data.sales_trend} color="#00C49F" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Platform Performance */}
      <div className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={data.platform_revenue_breakdown} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={data.top_categories} />
          </CardContent>
        </Card>
      </div>

      {/* Platform Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {data.platform_metrics.map((platform) => (
              <Card key={platform.platform}>
                <CardHeader>
                  <CardTitle className="text-lg">{platform.platform}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">Revenue: </span>
                      <span className="font-medium">{formatCurrency(platform.total_revenue)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Sales: </span>
                      <span className="font-medium">{formatNumber(platform.total_sales)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Avg Price: </span>
                      <span className="font-medium">{formatCurrency(platform.average_price)}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Growth: </span>
                      <span className={`font-medium ${platform.growth_rate >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {formatPercent(platform.growth_rate)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
