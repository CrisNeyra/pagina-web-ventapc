import { Controller, Get, Param, Query } from "@nestjs/common";
import { ProductsService } from "./products.service";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  listar(
    @Query("categoria") categoria?: string,
    @Query("busqueda") busqueda?: string,
    @Query("soloStock") soloStock?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    return this.productsService.listar({
      categoria,
      busqueda,
      soloStock: soloStock === "true",
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 50,
    });
  }

  @Get(":idOrSlug")
  obtener(@Param("idOrSlug") idOrSlug: string) {
    if (idOrSlug.includes("-") && idOrSlug.length > 20) {
      return this.productsService.obtenerPorSlug(idOrSlug);
    }
    return this.productsService.obtenerPorId(idOrSlug);
  }
}
