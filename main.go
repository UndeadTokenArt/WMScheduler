package main

import (
	"net/http"

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
	r.Static("/static", "./static")

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index.tmpl", gin.H{
			"Title": "InitiativeDrop",
		})
	})
	r.POST("/routes", controllers.AddRoute)
	r.GET("/routes", controllers.AllRoutes)
	r.PUT("/routes/:ID", controllers.RouteUpdate)
	r.DELETE("/routes/:ID", controllers.RouteDelete)
	r.GET("/routes/:Name", controllers.GetRouteByName)
	r.GET("/canvas", controllers.CanvasTest)
	r.GET("/routetools", controllers.MapTest)
	r.GET("/leaflet", controllers.Leaflet)

	r.Run() // listen and serve on 0.0.0.0:3000 (the default port)
}
