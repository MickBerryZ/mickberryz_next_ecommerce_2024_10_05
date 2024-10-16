import { wixClientServer } from "@/lib/wixClientServer";
import { products } from "@wix/stores";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

const PRODUCT_PER_PAGE = 20;

const ProductList = async ({
  categoryId,
  limit,
  searchParams,
}: {
  categoryId: string;
  limit?: number;
  searchParams?: any;
}) => {
  // Step 1: Check if categoryId is missing
  if (!categoryId) {
    console.error("categoryId is missing or invalid.");
    return <div>No category selected.</div>;
  }

  const wixClient = await wixClientServer();

  // Step 2: Query products only if categoryId is valid
  // try {
  const res = await wixClient.products
    .queryProducts()
    .eq("collectionIds", categoryId) // categoryId is valid here
    .limit(limit || PRODUCT_PER_PAGE)
    .find();
  console.log(res.items[0].price); // Debugging line

  return (
    <div className="mt-12 flex gap-x-8 gap-y-16 justify-between flex-wrap ">
      {res.items.map((product: products.Product) => (
        <Link
          href={"/" + product.slug}
          className="w-full flex flex-col gap-4 sm:w-[45%] lg:w-[22%]"
          key={product._id}
        >
          <div className="relative w-full h-80">
            <Image
              src={product.media?.mainMedia?.image?.url || "/product.png"}
              alt=""
              fill
              sizes="25vw"
              className="absolute object-cover rounded-md z-10 hover:opacity-0 transition-opacity easy duration-500"
            />
            {product.media?.items && product.media?.items[1]?.image?.url && (
              <Image
                src={product.media.items[1].image.url || "/product.png"}
                alt=""
                fill
                sizes="25vw"
                className="absolute object-cover rounded-md"
              />
            )}
          </div>

          <div className="flex justify-between">
            <span className="font-medium">{product.name}</span>
            <span className="font-semibold">${product.price?.price}</span>
          </div>
          {product.additionalInfoSections && (
            <div
              className="text-sm text-gray-500"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(
                  product.additionalInfoSections.find(
                    (section: any) => section.title === "shortDesc"
                  )?.description || ""
                ),
              }}
            ></div>
          )}
          <button className="rounded-2xl ring-1 ring-mickberryz text-mickberryz w-max py-2 px-4 text-xs hover:bg-mickberryz hover:text-white">
            Add to Cart
          </button>
        </Link>
      ))}
    </div>
  );
  // } catch (error) {
  //   console.error("Error fetching products:", error);
  //   return <div>Error loading products.</div>;
  // }
};

export default ProductList;
