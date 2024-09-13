package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/undeadtoken/WMscheduler/initializers"
	"github.com/undeadtoken/WMscheduler/models"
)

func AddTableByType(c *gin.Context) {
	// at the moment this fucntion is not actually connected to anything

	// get the type of table that is going to be added to the database

	// this forms the model for what data to add to the struct from the json coming in
	var data struct {
		RouteName string
		Driver    string
		Truck     string
		Disposal  string
		Cover     string
		Comments  string
	}

	//Binds the incoming information to the data struct reference
	c.Bind(&data)

	// a new variable for the information is created to reference later by the Database
	route := models.Route{

		RouteName: data.RouteName,
		Driver:    data.Driver,
		Truck:     data.Truck,
		Disposal:  data.Disposal,
		Cover:     data.Cover,
		Comments:  data.Comments,
	}

	//
	initializers.DB.AutoMigrate(&route)
	routeName := route.RouteName
	check := isExistingRoute(routeName)
	if !check {
		result := initializers.DB.Create(&route)
		// resond with error when Database is not creating the table
		if result.Error != nil {
			c.Status(400)
			return
		}
		// responds generated from list of all routes in the database
		c.JSON(200, gin.H{
			"route": route,
		})
	}
	// respond with error message if the route exists in the database
	c.JSON(200, gin.H{
		"Error": "Route already exists!",
	})
}

// basic Crud operations on the route model
func AddRoute(c *gin.Context) {

	//
	var data struct {
		RouteName string
		Driver    string
		Truck     string
		Disposal  string
		Cover     string
		Comments  string
	}

	//bind the reference to the route table something something JSON
	c.Bind(&data)

	route := models.Route{
		RouteName: data.RouteName,
		Driver:    data.Driver,
		Truck:     data.Truck,
		Disposal:  data.Disposal,
		Cover:     data.Cover,
		Comments:  data.Comments,
	}

	initializers.DB.AutoMigrate(&route)
	routeName := route.RouteName

	// check to see if there is an existing route with by that name
	check := isExistingRoute(routeName)
	if !check {
		result := initializers.DB.Create(&route)
		if result.Error != nil {
			c.Status(400)
			return
		}
		c.JSON(200, gin.H{
			"route": route,
		})
	}

	c.JSON(200, gin.H{
		"Error": "Route already exists!",
	})
}

func AllRoutes(c *gin.Context) {
	var routes []models.Route
	initializers.DB.Find(&routes)

	// return all posts
	c.JSON(200, gin.H{
		"Route": routes,
	})
}

/* func RouteByID(c *gin.Context) {
	//get id from URL
	ID := c.Param("ID")

	var route models.Route
	initializers.DB.First(&route, ID)

	// return all posts
	c.JSON(200, gin.H{
		"Route": route,
	})
} */

func GetRouteName(c *gin.Context) {
	routeName := c.Param("Name")

	var route models.Route
	if err := initializers.DB.Where("route_name = ?", routeName).First(&route).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
		return
	}

	c.JSON(http.StatusOK, route)
}

func RouteUpdate(c *gin.Context) {
	//get ID from URL
	ID := c.Param("ID")

	var route models.Route
	initializers.DB.First(&route, ID)

	// Get request data
	var data struct {
		RouteName string
	}
	c.Bind(&data)

	//update it the route model
	initializers.DB.Model(&route).Updates(models.Route{
		RouteName: data.RouteName,
	})

	//respond
	c.JSON(200, gin.H{
		"Route": route,
	})
}

func RouteDelete(c *gin.Context) {
	//get ID from URL
	ID := c.Param("ID")

	// Delete route
	initializers.DB.Delete(&models.Route{}, ID)

	// respond
	c.Status(200)
}

func Status(c *gin.Context) {
	c.HTML(http.StatusOK, "index.tmpl", gin.H{
		"title": "Page Loaded correctly",
	})
}
