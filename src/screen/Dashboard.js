import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  AppBar,
  Badge,
  Box,
  Button,
  Card,   
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  Snackbar,
  FormControl,
  InputLabel,
} from '@mui/material'
import {
  Analytics as AnalyticsIcon,
  Dashboard,
  AddCircleOutlined,
  RemoveCircleOutlined,
  LocalDining,
  Logout,
  NotificationsNone,
  Person,
  Restaurant,
  Settings,
  ShoppingCart,
  Save,
  Edit,
  Delete,
  BarChart,
  AttachMoney,
  Print,
} from '@mui/icons-material'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

export default function RestaurantPOS() {
  const [activeTab, setActiveTab] = useState('Dashboard')
  const [cart, setCart] = useState([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isPrinted, setIsPrinted] = useState(false)
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    address: '',
    orderType: 'dine-in',
  })
  const [savedCustomers, setSavedCustomers] = useState([])
  const [editingCustomerId, setEditingCustomerId] = useState(null)
  const [showCustomerManagement, setShowCustomerManagement] = useState(false)
  const [anchorEl, setAnchorEl] = useState(null)
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [userRole, setUserRole] = useState('User')
  const [loginActivity, setLoginActivity] = useState([])
  const [products, setProducts] = useState([])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [theme, ] = useState('light')
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    image: '/placeholder.svg?height=120&width=120',
    category: 'BBQ'
  })
  const [includeSRB, setIncludeSRB] = useState(false)
  const [includeSRBBank, setIncludeSRBBank] = useState(false)

  const componentRef = useRef(null)

  useEffect(() => {
    const fetchedProducts = [
      { name: 'BBQ Ribs', price: 15.00, image: '/placeholder.svg?height=120&width=120', category: 'BBQ' },
      { name: 'Grilled Chicken', price: 12.00, image: '/placeholder.svg?height=120&width=120', category: 'BBQ' },
      { name: 'Smoked Brisket', price: 17.00, image: '/placeholder.svg?height=120&width=120', category: 'BBQ' },
      { name: 'Pulled Pork', price: 13.00, image: '/placeholder.svg?height=120&width=120', category: 'BBQ' },
      { name: 'BBQ Sausage', price: 11.00, image: '/placeholder.svg?height=120&width=120', category: 'BBQ' },
      { name: 'Beef Ribs', price: 18.00, image: '/placeholder.svg?height=120&width=120', category: 'BBQ' },
      { name: 'Margherita Pizza', price: 10.00, image: '/placeholder.svg?height=120&width=120', category: 'Pizza' },
      { name: 'Pepperoni Pizza', price: 11.00, image: '/placeholder.svg?height=120&width=120', category: 'Pizza' },
      { name: 'Vegetarian Pizza', price: 11.00, image: '/placeholder.svg?height=120&width=120', category: 'Pizza' },
      { name: 'Hawaiian Pizza', price: 12.00, image: '/placeholder.svg?height=120&width=120', category: 'Pizza' },
      { name: 'Meat Lovers Pizza', price: 13.00, image: '/placeholder.svg?height=120&width=120', category: 'Pizza' },
      { name: 'Supreme Pizza', price: 14.00, image: '/placeholder.svg?height=120&width=120', category: 'Pizza' },
      { name: 'Spring Roll', price: 5.00, image: '/placeholder.svg?height=120&width=120', category: 'Roll' },
      { name: 'Egg Roll', price: 4.50, image: '/placeholder.svg?height=120&width=120', category: 'Roll' },
      { name: 'Sausage Roll', price: 6.00, image: '/placeholder.svg?height=120&width=120', category: 'Roll' },
      { name: 'Lobster Roll', price: 15.00, image: '/placeholder.svg?height=120&width=120', category: 'Roll' },
      { name: 'California Roll', price: 7.00, image: '/placeholder.svg?height=120&width=120', category: 'Roll' },
      { name: 'Cinnamon Roll', price: 3.50, image: '/placeholder.svg?height=120&width=120', category: 'Roll' },
    ]
    setProducts(fetchedProducts)
  }, [])

  const addToCart = useCallback((item) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.name === item.name)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((item) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.map((cartItem) =>
        cartItem.name === item.name ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
      )
      return updatedCart.filter((cartItem) => cartItem.quantity > 0)
    })
  }, [])

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  const calculateTotalQuantity = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }, [cart])

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false)
    setLoginActivity(prev => [...prev, { action: 'Logout', timestamp: new Date().toISOString() }])
  }, [])

  const handleLogin = useCallback((role) => {
    setIsLoggedIn(true)
    setUserRole(role)
    const loginTimestamp = new Date().toISOString()
    setLoginActivity(prev => [
      ...prev, 
      { 
        action: 'Login', 
        role, 
        timestamp: loginTimestamp,
        email: email,
      }
    ])
  }, [email])

  const handlePrint = useCallback(() => {
    const content = componentRef.current;
    if (!content) return;

    setSnackbarMessage('Preparing document...');
    setSnackbarOpen(true);

    html2canvas(content).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        unit: 'mm',
        format: [80, 297], // Standard thermal receipt width (80mm)
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const userChoice = window.confirm('Do you want to print the document? Click OK to print, or Cancel to download.');

      if (userChoice) {
        pdf.autoPrint();
        pdf.output('dataurlnewwindow');
        setSnackbarMessage('Print successful!');
      } else {
        pdf.save('order_slip.pdf');
        setSnackbarMessage('Download successful!');
      }

      setIsPrinted(true);
      setSnackbarOpen(true);
    }).catch((error) => {
      console.error('Error generating PDF:', error);
      setSnackbarMessage('Failed to generate document. Please try again.');
      setSnackbarOpen(true);
    });
  }, []);

  const handleCustomerDetailChange = useCallback((event) => {
    const { name, value } = event.target
    setCustomerDetails(prevDetails => ({
      ...prevDetails,
      [name]: value
    }))
  }, [])

  const handleSaveCustomerDetails = useCallback(() => {
    if (editingCustomerId !== null) {
      setSavedCustomers(prevCustomers =>
        prevCustomers.map(customer =>
          customer.id === editingCustomerId ? { ...customerDetails, id: editingCustomerId } : customer
        )
      )
    } else {
      setSavedCustomers(prevCustomers => [
        ...prevCustomers,
        { ...customerDetails, id: Date.now() }
      ])
    }
    
    setShowCustomerManagement(true)
    setCustomerDetails({
      name: '',
      phone: '',
      address: '',
      orderType: 'dine-in',
    })
    setEditingCustomerId(null)
    setCart([])
    setIsPrinted(false)
  }, [customerDetails, editingCustomerId])

  const handleEditCustomer = useCallback((customer) => {
    setCustomerDetails(customer)
    setEditingCustomerId(customer.id)
    setIsPrinted(true)
  }, [])

  const handleDeleteCustomer = useCallback((customerId) => {
    setSavedCustomers(prevCustomers => prevCustomers.filter(customer => customer.id !== customerId))
    setShowCustomerManagement(true)
  }, [])

  const handleAnalyticsClick = useCallback((event) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleAnalyticsClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleAnalyticsItemClick = useCallback((item) => {
    setActiveTab(item)
    handleAnalyticsClose()
  }, [handleAnalyticsClose])

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false)
  }, [])

  const handleAddProduct = useCallback((newProduct) => {
    setProducts(prevProducts => [...prevProducts, newProduct])
  }, [])

  const handleNewProductInputChange = useCallback((event) => {
    const { name, value } = event.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  }, []);

  const handleNewProductSubmit = useCallback((event) => {
    event.preventDefault();
    handleAddProduct(newProduct);
    setNewProduct({
      name: '',
      price: '',
      image: '/placeholder.svg?height=120&width=120',
      category: 'BBQ'
    });
  }, [handleAddProduct, newProduct]);

  const renderFoodItems = useCallback((items) => (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.name}>
          <Card 
            sx={{ 
              bgcolor: theme === 'light' ? '#fff5f2' : '#2c2c2c',
              color: theme === 'light' ? 'inherit' : 'white',
              boxShadow: 'none',
              borderRadius: 4,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)'
              }
            }}
          >
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                p: 2 
              }}>
                <Box
                  component="img"
                  src={item.image}
                  alt={item.name}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 2,
                    filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                  }}
                />
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    fontWeight: 500,
                    mb: 1
                  }}
                >
                  {item.name}
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-between'
                }}>
                  <Box>
                    <Typography 
                      variant="h6" 
                      component="span"
                      sx={{ 
                        fontWeight: 'bold',
                        mr: 1
                      }}
                    >
                      ${item.price.toFixed(2)}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      onClick={() => removeFromCart(item)}
                      sx={{
                        bgcolor: '#f44336',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#d32f2f'
                        },
                        width: 36,
                        height: 36,
                        mr: 1
                      }}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <RemoveCircleOutlined sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => addToCart(item)}
                      sx={{
                        bgcolor: '#4caf50',
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#43a047'
                        },
                        width: 36,
                        height: 36
                      }}
                      aria-label={`Add ${item.name} to cart`}
                    >
                      <AddCircleOutlined sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card></Grid>
      ))}
    </Grid>
  ), [addToCart, removeFromCart, theme])

  const Receipt = ({ cart, calculateTotal, includeSRB, includeSRBBank }) => {
    const subtotal = calculateTotal();
    const srbAmount = includeSRB ? subtotal * 0.15 : 0;
    const srbBankAmount = includeSRBBank ? subtotal * 0.5 : 0;
    const total = subtotal + srbAmount + srbBankAmount;

    return (
      <Box sx={{ 
        width: '100%', 
        maxWidth: 250, 
        p: 2, 
        bgcolor: 'white', 
        color: 'black',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <Typography 
          variant="h6" 
          align="center" 
          sx={{ 
            fontSize: '1.25rem',
            fontWeight: 600,
            mb: 1
          }}
        >
          Foodies Restaurant
        </Typography>
        
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ mb: 2 }}
        >
          123 Main St, Anytown, AN 12345
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="body2" sx={{ mb: 1 }}>
          Order #: {Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }}>
          Date: {new Date().toLocaleString()}
        </Typography>

        <Divider sx={{ my: 2 }} />

        {cart.map((item, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 2,
              '&:last-child': { mb: 0 }
            }}
          >
            <Box>
              <Typography variant="body1">{item.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                ${item.price.toFixed(2)} x {item.quantity}
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ ml: 2 }}>
              ${(item.price * item.quantity).toFixed(2)}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">Subtotal:</Typography>
          <Typography variant="body1">${subtotal.toFixed(2)}</Typography>
        </Box>

        {includeSRB && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">SRB Cash (15%):</Typography>
            <Typography variant="body1">${srbAmount.toFixed(2)}</Typography>
          </Box>
        )}

        {includeSRBBank && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body1">SRB Bank (5%):</Typography>
            <Typography variant="body1">${srbBankAmount.toFixed(2)}</Typography>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" fontWeight="bold">Total:</Typography>
          <Typography variant="h6" fontWeight="bold">
            ${total.toFixed(2)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography 
          variant="h6" 
          fontWeight="bold"
          align="center" 
          sx={{ 
            mt: 2,
            color: 'text.secondary',
            fontSize: '0.75rem'
          }}
        >
          create by Soft-Technix
        </Typography>
      </Box>
    )
  }

  const renderContent = useCallback(() => {
    if (showCustomerManagement) {
      return (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Customer Management</Typography>
          <Typography sx={{ mb: 2 }}>View and manage your customer database, loyalty programs, and feedback here.</Typography>
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="customer data table">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Order Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {savedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{customer.orderType}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditCustomer(customer)} aria-label="edit">
                        <Edit />
                      </IconButton>
                      <IconButton onClick={() => handleDeleteCustomer(customer.id)} aria-label="delete">
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )
    }

    switch (activeTab) {
      case 'BBQ':
      case 'Roll':
      case 'Pizza':
        return (
          <>
            <Typography variant="h4" sx={{ mb: 3 }}>{activeTab} Menu</Typography>
            {renderFoodItems(products.filter(item => item.category === activeTab))}
          </>
        )
      case 'Dashboard':
        return (
          <Box sx={{ p: 3 }}>
            {userRole === 'Admin' && (
              <Box sx={{ mt: 3 }}>
                <Button variant="contained" onClick={() => setActiveTab('AddProduct')}>Add New Product</Button>
              </Box>
            )}
          </Box>
        )
      case 'Sale Report':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Sale Report</Typography>
            <Typography>Sales report for your restaurant.</Typography>
          </Box>
        )
      case 'Profit':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Profit Analysis</Typography>
            <Typography>Profit report for your restaurant.</Typography>
          </Box>
        )
      case 'Settings':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Settings</Typography>
            <Typography>Manage your account settings, notifications, and preferences here.</Typography>
          </Box>
        )
      case 'Customer':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Customer Management</Typography>
            <Typography>View and manage your customer database, loyalty programs, and feedback here.</Typography>
          </Box>
        )
      case 'AddProduct':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Add New Product</Typography>
            <Box component="form" onSubmit={handleNewProductSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Product Name"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductInputChange}
                required
              />
              <TextField
                label="Price"
                name="price"
                type="number"
                value={newProduct.price}
                onChange={handleNewProductInputChange}
                required
              />
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  label="Category"
                  name="category"
                  value={newProduct.category}
                  onChange={handleNewProductInputChange}
                  required
                >
                  <MenuItem value="BBQ">BBQ</MenuItem>
                  <MenuItem value="Pizza">Pizza</MenuItem>
                  <MenuItem value="Roll">Roll</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained">Add Product</Button>
            </Box>
          </Box>
        )
      case 'LoginActivity':
        return (
          <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3 }}>Login Activity</Typography>
            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="login activity table">
                <TableHead>
                  <TableRow>
                    <TableCell>Action</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loginActivity.map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>{activity.role || 'N/A'}</TableCell>
                      <TableCell>{activity.email || 'N/A'}</TableCell>
                      <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )
      default:
        return null
    }
  }, [showCustomerManagement, activeTab, renderFoodItems, products, savedCustomers, handleEditCustomer, handleDeleteCustomer, userRole, loginActivity, handleNewProductSubmit, newProduct, handleNewProductInputChange])

  if (!isLoggedIn) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Card sx={{ minWidth: 300, p: 3 }}>
          <Typography 
            variant="h3" 
            sx={{ 
              mb: 2, 
              fontFamily: 'Times New Roman, Times, serif', 
              textAlign: 'center' 
            }}
          >
            {userRole}
          </Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Developer">Developer</MenuItem>
          </Select>
          <Button 
            variant="contained" 
            onClick={() => handleLogin(userRole)} 
            fullWidth
            disabled={!email || !password}
          >
            Log In
          </Button>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', bgcolor: theme === 'light' ? '#f5f5f5' : '#1c1c1c', color: theme === 'light' ? 'inherit' : 'white', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 190,
          flexShrink: 0,
          bgcolor: theme === 'light' ? 'white' : '#2c2c2c',
          color: theme === 'light' ? 'inherit' : 'white',
          p: 2,
          borderRight: '1px solid #eee',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocalDining sx={{ color: '#ff5722', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Foodies
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              fontFamily: 'Times New Roman, Times, serif', 
              textAlign: 'center' 
            }}
          >
            Role: {userRole}
          </Typography>
        </Box>

        <List>
          {[
            { text: 'Dashboard', icon: <Dashboard />, roles: ['User', 'Admin', 'Developer'] },
            { text: 'BBQ', icon: <Restaurant />, roles: ['User', 'Admin', 'Developer'] },
            { text: 'Pizza', icon: <Restaurant />, roles: ['User', 'Admin', 'Developer'] },
            { text: 'Roll', icon: <Restaurant />, roles: ['User', 'Admin', 'Developer'] },
            { text: 'Analytics', icon: <AnalyticsIcon />, roles: ['Admin', 'Developer'] },
            { text: 'Customer', icon: <Person />, roles: ['Admin', 'Developer'] },
            { text: 'Settings', icon: <Settings />, roles: ['User', 'Admin', 'Developer'] },
            { text: 'LoginActivity', icon: <BarChart />, roles: ['Developer'] },
          ].filter(item => item.roles.includes(userRole)).map((item) => (
            <ListItem
              button
              key={item.text}
              selected={activeTab === item.text}
              onClick={item.text === 'Analytics' ? handleAnalyticsClick : () => setActiveTab(item.text)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
          <ListItem button sx={{ color: 'error.main' }} onClick={handleLogout}>
            <ListItemIcon>
              <Logout sx={{ color: 'error.main' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>

      {/* Analytics Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleAnalyticsClose}
      >
        <MenuItem onClick={() => handleAnalyticsItemClick('Sale Report')}>
          <BarChart sx={{ mr: 1 }} /> Sale Report
        </MenuItem>
        <MenuItem onClick={() => handleAnalyticsItemClick('Profit')}>
          <AttachMoney sx={{ mr: 1 }} /> Profit
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 3 }}>
          <Toolbar>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton aria-label="shopping cart">
              <Badge badgeContent={calculateTotalQuantity()} color="error">
                <ShoppingCart />
              </Badge>
            </IconButton>
            <IconButton aria-label="notifications">
              <Badge badgeContent={1} color="error">
                <NotificationsNone />
              </Badge>
            </IconButton>
          </Toolbar>
        </AppBar> 
        {renderContent()}
      </Box>

      {/* Order Details Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 280,
          flexShrink: 0,
          bgcolor: theme === 'light' ? 'white' : '#2c2c2c',
          color: theme === 'light' ? 'inherit' : 'white',
          p: 2,
          borderLeft: '1px solid #eee',
          overflowY: 'auto',
        }}
      >
        {!isPrinted ? (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Order Details
            </Typography>
            <Box ref={componentRef}>
              <Receipt 
                cart={cart} 
                calculateTotal={calculateTotal} 
                includeSRB={includeSRB} 
                includeSRBBank={includeSRBBank} 
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSRB}
                  onChange={(e) => setIncludeSRB(e.target.checked)}
                />
              }
              label=" SRB Cash (15%)"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeSRBBank}
                  onChange={(e) => setIncludeSRBBank(e.target.checked)}
                />
              }
              label="SRB Bank"
            />
            <Button 
              variant="contained" 
              fullWidth 
              size="large" 
              startIcon={<Print />}
              sx={{ bgcolor: '#ff5722', '&:hover': { bgcolor: '#e64a19' }, mt: 2 }}
              onClick={handlePrint}
            >
              Print or Download Order
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {editingCustomerId !== null ? 'Edit Customer Details' : 'Add Customer Details'}
            </Typography>
            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={customerDetails.name}
                onChange={handleCustomerDetailChange}
                fullWidth
              />
              <TextField
                label="Phone"
                name="phone"
                type="tel"
                value={customerDetails.phone}
                onChange={handleCustomerDetailChange}
                fullWidth
              />
              <TextField
                label="Address"
                name="address"
                multiline
                rows={3}
                value={customerDetails.address}
                onChange={handleCustomerDetailChange}
                fullWidth
              />
              <Select
                label="Order Type"
                name="orderType"
                value={customerDetails.orderType}
                onChange={handleCustomerDetailChange}
                fullWidth
              >
                <MenuItem value="dine-in">Dine-in</MenuItem>
                <MenuItem value="takeaway">Takeaway</MenuItem>
                <MenuItem value="delivery">Delivery</MenuItem>
              </Select>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSaveCustomerDetails}
                fullWidth
                sx={{ mt: 2 }}
              >
                {editingCustomerId !== null ? 'Update Customer Details' : 'Save Customer Details'}
              </Button>
            </Box>
          </>
        )}
      </Box>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Box>
  )
}