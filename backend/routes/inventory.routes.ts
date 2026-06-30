import express from 'express'
import { addStock, createInventory, deleteInventory, getAllInventory, getAllInventoryAggragation, getInventoryById, getInventoryHistory, getLowStockProducts, updateInventory } from '../controller/new.inventory'
import { isAuth } from '../middaleware/auth.middleware'

const inventoryRouter = express.Router()

inventoryRouter.post("/create",isAuth,createInventory)
inventoryRouter.get("/getAllInventory",isAuth,getAllInventory)
inventoryRouter.get("/getInventoryById/:id",isAuth,getInventoryById)
inventoryRouter.put("/updateInventory/:id",isAuth,updateInventory)
inventoryRouter.post("/addStock/:id",isAuth,addStock)
inventoryRouter.delete("/deleteInventory/:id",isAuth,deleteInventory)
inventoryRouter.get("/getLowStockProducts",isAuth,getLowStockProducts)
inventoryRouter.get("/getInventoryHistory/:id",isAuth,getInventoryHistory)
inventoryRouter.get("/getAllInventoryAggragation",getAllInventoryAggragation)

export default inventoryRouter