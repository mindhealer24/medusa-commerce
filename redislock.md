Locking Module
In this document, you'll learn about the Locking Module and its providers.

What is the Locking Module?#
The Locking Module manages access to shared resources by multiple processes or threads. It prevents conflicts between processes that are trying to access the same resource at the same time, and ensures data consistency.

Medusa uses the Locking Module to control concurrency, avoid race conditions, and protect parts of code that should not be executed by more than one process at a time. This is especially essential in distributed or multi-threaded environments.

For example, Medusa uses the Locking Module in inventory management to ensure that only one transaction can update the stock levels at a time. By using the Locking Module in this scenario, Medusa prevents overselling an inventory item and keeps its quantity amounts accurate, even during high traffic periods or when receiving concurrent requests.

How to Use the Locking Module?#
You can use the Locking Module as part of the workflows you build for your custom features. A workflow is a special function composed of a series of steps that guarantees data consistency and reliable roll-back mechanism.

In a step of your workflow, you can resolve the Locking Module's service and use its methods to execute an asynchronous job, acquire a lock, or release locks.

For example:

Code
Ask AI
import { Modules } from "@medusajs/framework/utils"
import { 
  createStep,
  createWorkflow,
} from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async ({}, { container }) => {
    const lockingModuleService = container.resolve(
      Modules.LOCKING
    )
    const productModuleService = container.resolve(
      Modules.PRODUCT
    )

    await lockingModuleService.execute("prod_123", async () => {
      await productModuleService.deleteProduct("prod_123")
    })
  } 
)

export const workflow = createWorkflow(
  "workflow-1",
  () => {
    step1()
  }
)
In the example above, you create a workflow that has a step. In the step, you resolve the services of the Locking and Product modules from the Medusa container.

Then, you use the execute method of the Locking Module to acquire a lock for the product with the ID prod_123 and execute an asynchronous function, which deletes the product.

When to Use the Locking Module?#
You should use the Locking Module when you need to ensure that only one process can access a shared resource at a time. As mentioned in the inventory example previously, you don't want customers to order quantities of inventory that are not available, or to update the stock levels of an item concurrently.

In those scenarios, you can use the Locking Module to acquire a lock for a resource and execute a critical section of code that should not be accessed by multiple processes simultaneously.

What is a Locking Module Provider?#
A Locking Module Provider implements the underlying logic of the Locking Module. It manages the locking mechanisms and ensures that only one process can access a shared resource at a time.

Medusa provides multiple Locking Module Providers that are suitable for development and production. You can also create a custom Locking Module Provider to implement custom locking mechanisms or integrate with third-party services.

Default Locking Module Provider#
By default, Medusa uses the In-Memory Locking Module Provider. This provider uses a plain JavaScript map to store the locks. While this is useful for development, it is not recommended for production environments as it is only intended for use in a single-instance environment.

To add more providers, you can register them in the medusa-config.ts file. For example:

Code
Ask AI
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          // add providers here...
        ],
      },
    },
  ],
})
When you register other providers in medusa-config.ts, Medusa will set the default provider based on the following scenarios:

Scenario	Default Provider
One provider is registered.

The registered provider.

Multiple providers are registered and none of them has an is_default flag.

In-Memory Locking Module Provider.

Multiple providers and one of them has an is_default flag.

The provider with the is_default flag.










Redis Locking Module Provider
The Redis Locking Module Provider uses Redis to manage locks across multiple instances of Medusa. Redis ensures that locks are globally available, which is ideal for distributed environments.

This provider is recommended for production environments where Medusa is running in a multi-instance setup.

Register the Redis Locking Module Provider#

Prerequisites
1
A redis server set up locally or a database in your deployed application.↗
To register the Redis Locking Module Provider, add it to the list of providers of the Locking Module in medusa-config.ts:

medusa-config.ts
Ask AI
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            // set this if you want this provider to be used by default
            // and you have other Locking Module Providers registered.
            is_default: true,
            options: {
              redisUrl: process.env.LOCKING_REDIS_URL,
            },
          },
        ],
      },
    },
  ],
})
Environment Variables#
Make sure to add the following environment variable:

Terminal
Ask AI
LOCKING_REDIS_URL=<YOUR_LOCKING_REDIS_URL>
Where <YOUR_LOCKING_REDIS_URL> is the URL of your Redis server, either locally or in the deployed environment.

Tip: The default Redis URL in a local environment is redis://localhost:6379.
Redis Locking Module Provider Options#
Option	Description	Required	Default
redisUrl

A string indicating the Redis connection URL.

Yes

-

redisOptions

An object of Redis options. Refer to the Redis API Reference for details on accepted properties.

No

-

namespace

A string used to prefix all locked keys with {namespace}.

No

medusa_lock:. So, all locked keys are prefixed with medusa_lock:.

waitLockingTimeout

A number indicating the default timeout (in seconds) to wait while acquiring a lock. This timeout is used when no timeout is specified when executing an asynchronous job or acquiring a lock.

No

5

defaultRetryInterval

A number indicating the time (in milliseconds) to wait before retrying to acquire a lock.

No

5

maximumRetryInterval

A number indicating the maximum time (in milliseconds) to wait before retrying to acquire a lock.

No

200

Test out the Module#
To test out the Redis Locking Module Provider, start the Medusa application:

npm
yarn
pnpm
Ask AI
npm run dev
You'll see the following message logged in the terminal:

Terminal
Ask AI
info:    Connection to Redis in "locking-redis" provider established
This message indicates that the Redis Locking Module Provider has successfully connected to the Redis server.

If you set the is_default flag to true in the provider options or you only registered the Redis Locking Module Provider, the Locking Module will use it by default for all locking operations.

Use Provider with Locking Module#
The Redis Locking Module Provider will be the default provider if you don't register any other providers, or if you set the is_default flag to true:

medusa-config.ts
Ask AI
module.exports = defineConfig({
  // ...
  modules: [
    {
      resolve: "@medusajs/medusa/locking",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/locking-redis",
            id: "locking-redis",
            is_default: true,
            options: {
              // ...
            },
          },
        ],
      },
    },
  ],
})
If you use the Locking Module in your customizations, the Redis Locking Module Provider will be used by default in this case. You can also explicitly use this provider by passing its identifier lp_locking-redis to the Locking Module's service methods.

For example, when using the acquire method in a workflow step:

Code
Ask AI
import { Modules } from "@medusajs/framework/utils"
import { createStep } from "@medusajs/framework/workflows-sdk"

const step1 = createStep(
  "step-1",
  async ({}, { container }) => {
    const lockingModuleService = container.resolve(
      Modules.LOCKING
    )

    await lockingModuleService.acquire("prod_123", {
      provider: "lp_locking-redis",
    })
  } 
)
