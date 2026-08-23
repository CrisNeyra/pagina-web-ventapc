import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(opciones: {
    categoria?: string;
    busqueda?: string;
    soloStock?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = opciones.page ?? 1;
    const limit = Math.min(opciones.limit ?? 50, 100);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (opciones.categoria) where.categoria = opciones.categoria;
    if (opciones.soloStock) where.enStock = true;
    if (opciones.busqueda) {
      where.OR = [
        { nombre: { contains: opciones.busqueda, mode: "insensitive" } },
        { descripcion: { contains: opciones.busqueda, mode: "insensitive" } },
      ];
    }

    const [productos, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nombre: "asc" },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { productos, total, page, limit };
  }

  async obtenerPorId(id: string) {
    const producto = await this.prisma.product.findUnique({ where: { id } });
    if (!producto) throw new NotFoundException("PRODUCTO_NO_ENCONTRADO");
    return producto;
  }

  async obtenerPorSlug(slug: string) {
    const producto = await this.prisma.product.findUnique({ where: { slug } });
    if (!producto) throw new NotFoundException("PRODUCTO_NO_ENCONTRADO");
    return producto;
  }

  async actualizarStock(id: string, stock: number, enStock?: boolean) {
    return this.prisma.product.update({
      where: { id },
      data: {
        stock,
        enStock: enStock ?? stock > 0,
      },
    });
  }

  async reservarStock(
    tx: Prisma.TransactionClient,
    items: { productId: string; cantidad: number }[]
  ) {
    for (const item of items) {
      const actualizado = await tx.product.updateMany({
        where: {
          id: item.productId,
          stock: { gte: item.cantidad },
          enStock: true,
        },
        data: { stock: { decrement: item.cantidad } },
      });

      if (actualizado.count === 0) {
        throw new Error("SIN_STOCK");
      }

      const producto = await tx.product.findUnique({ where: { id: item.productId } });
      if (producto && producto.stock <= 0) {
        await tx.product.update({
          where: { id: item.productId },
          data: { enStock: false },
        });
      }
    }
  }

  async restaurarStock(
    tx: Prisma.TransactionClient,
    items: { productId: string; cantidad: number }[]
  ) {
    for (const item of items) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.cantidad },
          enStock: true,
        },
      });
    }
  }
}
