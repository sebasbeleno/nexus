import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@workspace/ui/components/card'; // Import Card components
import { BarChart, ListChecks, Users, Activity } from 'lucide-react'; // Import icons

// Mock data for the dashboard
const mockDashboardData = {
  activeSurveys: 5,
  completedSurveys: 120,
  responseRate: '85%',
  keyMetric1: '75%',
  keyMetric2: 1500,
  recentActivity: [
    { id: 1, description: 'New survey "Community Feedback" launched.' },
    { id: 2, description: 'User John Doe completed "Housing Needs Assessment".' },
    { id: 3, description: 'Analytics report for Q1 generated.' },
  ],
};

export default async function AdminPage() {
  return (
    <>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome, Admin! Here's an overview of your organization.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Surveys</CardTitle>
            <ListChecks className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.activeSurveys}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.responseRate}</div>
            <p className="text-xs text-muted-foreground">Average across all surveys</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Metric 1</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.keyMetric1}</div>
            <p className="text-xs text-muted-foreground">Description of metric 1</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Key Metric 2</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockDashboardData.keyMetric2}</div>
            <p className="text-xs text-muted-foreground">Description of metric 2</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates and actions within the organization.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {mockDashboardData.recentActivity.map((activity) => (
                <li key={activity.id} className="text-sm text-muted-foreground">
                  {activity.description}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
