import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const PRODUCT_FIELD_WHITELIST = [
  "id",
  "name",
  "description",
  "price",
  "category",
  "stock",
  "imageUrl",
  "isActive",
  "createdAt",
  "updatedAt",
];

const MAX_LIMIT = 100;

export async function getProducts(query) {
  // Parse pagination
  let page = parseInt(query.page) || 1;
  let limit = parseInt(query.limit) || 20;
  if (limit > MAX_LIMIT) limit = MAX_LIMIT;
  if (page < 1) throw { status: 400, message: "Invalid page number" };
  if (limit < 1) throw { status: 400, message: "Invalid limit" };
  const skip = (page - 1) * limit;

  // Parse sorting
  let sortBy = query.sortBy || "id";
  let order = (query.order || "asc").toLowerCase();
  if (!PRODUCT_FIELD_WHITELIST.includes(sortBy)) sortBy = "id";
  if (!["asc", "desc"].includes(order)) order = "asc";

  // Parse field selection
  let select = undefined;
  if (query.fields) {
    const fields = query.fields.split(",").map((f) => f.trim());
    // Check for invalid fields
    for (const field of fields) {
      if (!PRODUCT_FIELD_WHITELIST.includes(field)) {
        throw { status: 400, message: `Invalid field: ${field}` };
      }
    }
    select = {};
    fields.forEach((f) => {
      select[f] = true;
    });
  }

  // Get total count for meta
  const total = await prisma.product.count();

  // Query products
  const products = await prisma.product.findMany({
    skip,
    take: limit,
    orderBy: { [sortBy]: order },
    ...(select ? { select } : {}),
  });

  // Meta info
  const meta = {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
  return { data: products, meta };
}

export async function getProductById(id) {
  return prisma.product.findUnique({ where: { id } });
}
