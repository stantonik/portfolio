
# Portfolio

> This is my personal portfolio developed in vanilla TypeScript with Vite and deployed on Vercel.

You can find many of my projects and experiences on this website.

**Architecture:**

I did not want to mix assets that will change very often such as project markdown files, images, videos, ... with the code of the website. Thus, my assets are stored on a AWS S3 Bucket (Free-tier) and accessed through my Vercel Proxy (Assets manifest mapping), then passing through my CloudFront CDN to finally hit the Bucket.

I'm doing cache-busting where every file stored on the Bucket (except assets-manifest.json) have its hashed content inserted in the filename (eg: demo.abcdef1245.gif) in order to limit hitting on my CDN/Bucket free-tier.

As you can see I have a "s3sync.py" to help me synchronize my local files with my Bucket while adding hashes in filenames. For example, locally in my repo I can do:

```bash
python s3sync.py pull
```

To have my Bucket downloaded in ```public/s3``` as following:

```text
portfolio/
├─ public/
│  ├─ s3/
│  │  ├─ projects/
│  │  │  ├─ connectedclay/
│  │  │  │  ├─ assets/
│  │  │  │  │  ├─ presentation.webp
│  │  │  │  ├─ connectedclay.md
│  │  │  ├─ projects.json
```

Then after some modifications, I can simply do:

```bash
python s3sync.py status # Print edited files
python s3sync.py push
```

And the new generated asset manifest along with the edited files with hashed filename will be upload on the Bucket and be then requested again by the Client/Proxy.
