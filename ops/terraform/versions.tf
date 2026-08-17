terraform {
  required_version = ">= 1.9"

  required_providers {
    # No cloud provider pinned yet — infra target (AWS for Nitro Enclaves
    # per STACK ADR-4, at minimum) isn't decided in this scaffold pass.
  }
}
