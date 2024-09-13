package main

import (
	"github.com/gin-gonic/gin"
	"github.com/undeadtoken/WMscheduler/controllers"
	initializers "github.com/undeadtoken/WMscheduler/initializers"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectDB()
}

func main() {

	r := gin.Default()
	r.LoadHTMLGlob("templates/*")

	r.GET("/", controllers.Status)
	r.POST("/routes", controllers.AddRoute)
	r.GET("/routes", controllers.AllRoutes)
	r.PUT("/routes/:ID", controllers.RouteUpdate)
	r.DELETE("/routes/:ID", controllers.RouteDelete)
	r.GET("/routes/:Name", controllers.GetRouteName)
	// r.GET("/routes/:ID", controllers.RouteByID)


	r.Run() // listen and server on 0.0.0.0:3000 this is based on the Enviroment variable
}
