import { wixClientServer } from "@/lib/wixClientServer";
import Link from "next/link";
import { notFound } from "next/navigation";

const OrderPage = async ({ params }: { params: { id: string } }) => {
  const id = params.id;

  const wixClient = await wixClientServer();

  let order;
  try {
    order = await wixClient.orders.getOrder(id);
  } catch (err) {
    return notFound();
  }

  console.log(order);

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] items-center justify-center">
      <h1 className="text-xl font-bold">Order Details</h1>
      <div className="mt-12 flex flex-col gap-6">
        <div className="">
          <span className="font-medium">Order Id: </span>
          <span className="">{order._id}</span>
        </div>
        <div className="">
          <span className="font-medium">Receiver Name: </span>
          <span className="">
            {order.billingInfo?.contactDetails?.firstName + " "}
            {order.billingInfo?.contactDetails?.lastName}
          </span>
        </div>
        <div className="">
          <span className="font-medium">Receiver Email: </span>
          <span className="">{order.buyerInfo?.email}</span>
        </div>
        <div className="">
          <span className="font-medium">Price: </span>
          <span className="">{order.priceSummary?.subtotal?.amount}</span>
        </div>
        <div className="">
          <span className="font-medium">Payment Status: </span>
          <span className="">{order.paymentStatus}</span>
        </div>
        <div className="">
          <span className="font-medium">Order Status: </span>
          <span className="">{order.status}</span>
        </div>
        <div className="">
          <span className="font-medium">Delivery Address: </span>
          <span className="">
            {order.billingInfo?.address?.addressLine1 + " "}
            {order.billingInfo?.address?.city}
          </span>
        </div>
      </div>
      <Link href="/" className="underline mt-6">
        Have a problem? <br />
        Contact us
      </Link>
    </div>
  );
};

export default OrderPage;
