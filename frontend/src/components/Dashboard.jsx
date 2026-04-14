import React, { useState, useEffect } from 'react'
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Collapse,
  MenuList,
  MenuItem
} from '@mui/material'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalPurchases: 0,
    totalReturns: 0,
    totalGrains: 0,
    totalFlourOut: 0
  })

  const [recentActivities, setRecentActivities] = useState([])
  const [entryMenuOpen, setEntryMenuOpen] = useState(false)

  useEffect(() => {
    // Fetch dashboard data from API
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Mock data for now
      setStats({
        totalPurchases: 150,
        totalReturns: 12,
        totalGrains: 5000,
        totalFlourOut: 3000
      })
      setRecentActivities([
        { id: 1, action: 'Purchase created', time: '2 hours ago' },
        { id: 2, action: 'Grains processed', time: '4 hours ago' },
        { id: 3, action: 'Flour out completed', time: '6 hours ago' },
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Purchases',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Returns',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Purchase and Return Trends',
      },
    },
  }

  const handleEntryClick = () => {
    setEntryMenuOpen(!entryMenuOpen)
  }

  const navigateToPage = (page) => {
    window.location.href = `/${page}`
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* Page Title */}
      <Paper sx={{ p: 2, mb: 2, backgroundColor: '#3c78d8', color: 'white' }}>
        <Typography variant="h6">
          Dashboard
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Stats Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Purchases
              </Typography>
              <Typography variant="h5">
                {stats.totalPurchases}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Returns
              </Typography>
              <Typography variant="h5">
                {stats.totalReturns}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Grains (kg)
              </Typography>
              <Typography variant="h5">
                {stats.totalGrains.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Flour Out (kg)
              </Typography>
              <Typography variant="h5">
                {stats.totalFlourOut.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Bar data={chartData} options={chartOptions} />
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemText
                      primary={activity.action}
                      secondary={activity.time}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Dashboard
