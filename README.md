js-local-vcf
============

Javascript local VCF and Tabix index file parsing and processing


Usage:

Include the following libs:

https://raw.github.com/vjeux/jDataView/master/src/jdataview.js
https://raw.github.com/vjeux/jParser/master/src/jparser.js
inflate.js (fetch and place or fetch remotely)
binary-vcf.js (this file)


There are two 'object' types with constructors:

readTabixFile which takes a filespec and initializes a tabix
reader.  Provides methods

  * getIndex - builds the index information
  * bin2Ranges - returns the chunk information for a [ref binid]
  * bin2Beg - returns first chunk of bin
  * bin2End - returns last chunk of bin
  * getChunks - returns all chunks for bins covering region in ref

Details below

readBinaryVCF which takes a tabix filespec and a BGZF VCF filespec
initializes a tabix reader and builds binary VCF reader.  Provides
methods

  * getHeader - obtains and returns the VCF header lines
  * getRecords - obtains the data records in a reference region and
                 returns as a vector of strings to provided callback
  * getChunks - returns all chunks covered by region

Details below

Example:

```javascript
With files[0] == vcf file
     files[1] == tabix file

vcfR = new readBinaryVCF(files[1], files[0]);
var x = undefined;
vcfR.getRecords(11, 1000000, 1015808, function(rs){x = rs;});
var chunks = vcfR.getChunks(11, 1000000, 1015808)
```


================== readTabixFile ===================

Constructor for tabix reader and decoder.  tabixfile is a bgzipped
tabix binary index file.

```javascript
function readTabixFile(tabixFile) {
```


Main function for a tabix reader.  Obtains and decodes the index
and caches information on it used by other methods.  So, must be
called before others.

```javascript
readTabixFile.prototype.getIndex = function(cb)
```


// Converts a reference name to its tabix index.  References in vcf
// processing always need to be by their index.  Requires that
// getIndex has been run

```javascript
readTabixFile.prototype.refName2Index = function(name)
```


Takes a ref and binid and builds a return vector mapped from the
chunk sequence of bin, where each element is a two element vector
defining the region of a chunk.  The begin and end of each region
are the base virtual file offsets (the 16 bit right shifted values)
and the offset within the INflated block (the lower 16 bits).
Returns a vector [[[vfbeg, bobeg], [vfend, boend]], ...] where

* vfbeg is the virtual file offset of beginning bgzf block
* bobeg is the offset within the inflated block of that block
* vfend is the virtual file offset of ending bgzf block
* boend is the offset of last byte in that block

```javascript
readBaiFile.prototype.bin2Ranges = function(ref, binid)
```


First chunk region of binid.

```javascript
readBaiFile.prototype.bin2Beg = function(binid)
```

Last chunk region of binid.

```javascript
readBaiFile.prototype.bin2End = function(binid)
```


For a reference REF region defined by BEG and END return the set of
chunks of all bins involved as a _flat_ vector of two element
vectors, each defining a region of a bin.

```javascript
readBaiFile.prototype.getChunks = function(ref, beg, end)
```




================== readBinaryVCF ===================


Constructor for BGZF VCF reader and decoder.  tabixfile is a bgzipped
tabix binary index file for VCFFILE, a BGZF encoded VCF file.  Inits
and builds index and initializes the VCF reader.

```javascript
function readBinaryVCF (tbxFile, vcfFile, cb) {
```


Obtain and return the VCF header information as a vector of strings.
Calls cbfn with this vector.  All header lines begin with a "#" and
start as the first line of the file and stop at first line starting
without a "#" in char pos 0.

```javascript
readBinaryVCF.prototype.getHeader =
    function (cbfn) {
```


Main function for VCF reader.  For a record region defined by BEG ad
END, obtains the set of bins and chunks covering the region, inflates
the corresponding data blocks, converts to a vector of strings (one
for each record) and filters these to ensure only those in the range
are kept.  The resulting filtered vector of strings is returned by
calling CBFN with the vector.

```javascript
readBinaryVCF.prototype.getRecords =
    function (ref, beg, end, cbfn) {
```


Synonym for tabix getChunks.  Directly callable on a vcfReader.

```javascript
readBinaryVCF.prototype.getChunks =
    function (ref, beg, end) {
```
