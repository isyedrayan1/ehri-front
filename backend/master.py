"""
Master entry point to run the EHIR backend
Supports configurable port via environment variable or CLI argument
Default port: 8000
"""
import subprocess
import sys
import os
import argparse

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Run EHIR Backend")
    parser.add_argument(
        "--port",
        type=int,
        default=None,
        help="Port to run the server on (default: 8000 or EHIR_PORT env var)"
    )
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host to bind to (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Enable auto-reload on file changes (development mode)"
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=1,
        help="Number of worker processes (default: 1)"
    )
    
    args = parser.parse_args()
    
    # Determine port: CLI arg > env var > default
    port = args.port or int(os.getenv("EHIR_PORT", "8000"))
    host = args.host or os.getenv("EHIR_HOST", "0.0.0.0")
    reload = args.reload or os.getenv("EHIR_RELOAD", "false").lower() == "true"
    workers = args.workers
    
    print(f"\n{'='*60}")
    print(f"🚀 Starting EHIR Backend")
    print(f"{'='*60}")
    print(f"  Host: {host}")
    print(f"  Port: {port}")
    print(f"  Reload: {reload}")
    print(f"  Workers: {workers}")
    print(f"  API Base: http://{host}:{port}/api")
    print(f"  Docs: http://{host}:{port}/docs")
    print(f"{'='*60}\n")
    
    # Build uvicorn command
    cmd = [
        sys.executable,
        "-m",
        "uvicorn",
        "app.main:app",
        "--host", str(host),
        "--port", str(port),
    ]
    
    if reload:
        cmd.append("--reload")
    
    if workers > 1:
        cmd.extend(["--workers", str(workers)])
    
    # Run the server
    subprocess.run(cmd)

if __name__ == "__main__":
    main()
