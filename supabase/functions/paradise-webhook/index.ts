import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

Deno.serve(async (req) => {
  // Webhooks come as POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const payload = await req.json();
    console.log("Webhook received:", JSON.stringify(payload));

    const { transaction_id, external_id, status, amount } = payload;

    if (!external_id && !transaction_id) {
      return new Response("Missing transaction reference", { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Map Paradise status to our status
    let orderStatus = "pending";
    if (status === "approved") orderStatus = "paid";
    else if (status === "failed" || status === "refunded" || status === "chargeback") orderStatus = "cancelled";
    else if (status === "pending" || status === "processing" || status === "under_review") orderStatus = "pending";

    // Update order by reference (external_id = our order id)
    const orderId = external_id || "";
    const { error } = await supabase
      .from("orders")
      .update({ status: orderStatus })
      .eq("id", orderId);

    if (error) {
      console.error("Error updating order:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    console.log(`Order ${orderId} updated to ${orderStatus}`);
    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Internal error", { status: 500 });
  }
});
