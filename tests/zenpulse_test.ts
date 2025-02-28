import {
  Clarinet,
  Tx,
  Chain,
  Account,
  types
} from 'https://deno.land/x/clarinet@v1.0.0/index.ts';
import { assertEquals } from 'https://deno.land/std@0.90.0/testing/asserts.ts';

Clarinet.test({
  name: "Test session creation and completion flow",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const user1 = accounts.get('wallet_1')!;
    
    // Create new session
    let block = chain.mineBlock([
      Tx.contractCall('zenpulse', 'create-session',
        [types.ascii("calm"), types.uint(300), types.principal(user1.address)],
        user1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectUint(1);
    
    // Complete session
    block = chain.mineBlock([
      Tx.contractCall('zenpulse', 'complete-session',
        [types.uint(1), types.principal(user1.address)],
        user1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Verify user stats
    let response = chain.callReadOnlyFn(
      'zenpulse',
      'get-user-stats',
      [types.principal(user1.address)],
      user1.address
    );
    
    const stats = response.result.expectOk().expectSome();
    assertEquals(stats['total-sessions'], types.uint(1));
    assertEquals(stats['total-duration'], types.uint(300));
    assertEquals(stats['tokens-earned'], types.uint(300));
  }
});

Clarinet.test({
  name: "Test session completion restrictions",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const user1 = accounts.get('wallet_1')!;
    const user2 = accounts.get('wallet_2')!;
    
    // Create session for user1
    let block = chain.mineBlock([
      Tx.contractCall('zenpulse', 'create-session',
        [types.ascii("calm"), types.uint(300), types.principal(user1.address)],
        user1.address
      )
    ]);
    
    // Try completing with wrong user
    block = chain.mineBlock([
      Tx.contractCall('zenpulse', 'complete-session',
        [types.uint(1), types.principal(user2.address)],
        user2.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(103);
    
    // Complete with correct user
    block = chain.mineBlock([
      Tx.contractCall('zenpulse', 'complete-session',
        [types.uint(1), types.principal(user1.address)],
        user1.address
      )
    ]);
    
    block.receipts[0].result.expectOk().expectBool(true);
    
    // Try completing again
    block = chain.mineBlock([
      Tx.contractCall('zenpulse', 'complete-session',
        [types.uint(1), types.principal(user1.address)],
        user1.address
      )
    ]);
    
    block.receipts[0].result.expectErr().expectUint(103);
  }
});
