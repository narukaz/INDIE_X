# Makefile

###########################
#  CONFIGURE THESE FIRST  #
###########################

# Your contract name
CONTRACT     := INDIX

# RPC & keys
RPC_URL      := http://127.0.0.1:8545
PRIVATE_KEY  := 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

# After deploy, paste the new address here (or override via CLI: `make register-dev CONTRACT_ADDRESS=0x...`)
CONTRACT_ADDRESS := 0x0C8E79F3534B00D9a3D4a856B665Bf4eBC22f2ba

# For registerDev you’ll need an ERC20 token with allowance already set:
DEV_TOKEN       := 0xYourTokenAddressHere
LOCK_AMOUNT     := 100    # in whole tokens

###########################
#       DEPLOYMENT        #
###########################

.PHONY: deploy
deploy:
	@echo "👉 Deploying $(CONTRACT) with owner = $(shell cast wallet-address --private-key $(PRIVATE_KEY))"
	forge create \
	  $(CONTRACT) \
	  --rpc-url $(RPC_URL) \
	  --private-key $(PRIVATE_KEY) \
	  --broadcast

###########################
#      VIEW FUNCTIONS     #
###########################

.PHONY: get-lock
get-lock:
	@echo "🔍 lockAmount (ETH):"
	@cast call \
	  $(CONTRACT_ADDRESS) \
	  "lockAmount() view returns (uint256)" \
	  --rpc-url $(RPC_URL) \
	| awk '{ printf("%.6f\n", $$1 / 10000000000000000000) }'




.PHONY: get-role
# pass ADDRESS on the CLI to inspect roles mapping
# e.g. make get-role ADDRESS=0x1234...
get-role:
ifndef ADDRESS
	$(error Please specify ADDRESS, e.g. make get-role ADDRESS=0x123...)
endif
	@echo "🔍 roles[$(ADDRESS)]:"
	cast call \
	  $(CONTRACT_ADDRESS) \
	  "roles(address) view returns (uint8)" \
	  $(ADDRESS) \
	  --rpc-url $(RPC_URL) | cast --to-dec

###########################
#      TRANSACTIONS       #
###########################

# Change lockAmount (in whole tokens)
.PHONY: change-lock
change-lock:
ifndef NEW_LOCK
	$(error Please specify NEW_LOCK, e.g. make change-lock NEW_LOCK=50)
endif
	@echo "🛠️  Changing lockAmount to $(NEW_LOCK) tokens (will be scaled by 1e18)"
	cast send \
	  $(CONTRACT_ADDRESS) \
	  "changeLockAmount(uint256)" \
	  $(NEW_LOCK) \
	  --rpc-url $(RPC_URL) \
	  --private-key $(PRIVATE_KEY) \
	 
	
.PHONY: register-dev
register-dev:
	@echo "🛠️  Registering dev (will transfer $(LOCK_AMOUNT) tokens)"
	@echo "   → make sure you’ve approved $(LOCK_AMOUNT) to $(CONTRACT_ADDRESS)"
	cast send \
	  $(CONTRACT_ADDRESS) \
	  "registerDev()" \
	  --rpc-url $(RPC_URL) \
	  --private-key $(PRIVATE_KEY)

###########################
#        TEST CALLS       #
###########################



.PHONY: clean
clean:
	@echo "🧹 Cleaning cache & artifacts"
	forge clean
