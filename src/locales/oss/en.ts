import { appNameMap } from '@/config/base-config'

export default {
  oss: {
    bucketList: 'Bucket List',
    resourcePackM: 'Resource Pack Management',
    createBucket: 'Create Bucket',
    bucketName: 'Bucket Name',
    usageStatistics: 'Usage Statistics',
    serviceOverview: 'Service Overview',
    // Tags
    tag: 'Tag',
    // Please enter bucket name
    pleaseEnterBucketName: 'Please enter bucket name',
    // Tag key and value should be separated by semicolon
    tagKeyAndValueSeparatedBySemicolon: 'Tag key and value should be separated by semicolon',
    // Buy resource pack
    buyPackage: 'Buy Resource Pack',
    // Batch set permissions
    batchSetPermissions: 'Batch Set Permissions',
    // Bucket does not support renaming
    bucketRenameNotSupported: 'Bucket does not support renaming',
    // Tag count
    tagCount: 'Tag Count',
    // Access permissions
    accessPermissions: 'Access Permissions',
    // Region
    region: 'Region',
    // Creation time
    createTime: 'Creation Time',
    // All
    all: 'All',
    // Japan Tokyo
    日本东京: 'Japan Tokyo',
    // Storage
    storage: 'Storage',
    // Storage data is not real-time, counted once daily, for reference only
    storageTip: 'Storage data is not real-time, counted once daily, for reference only',
    // Operations
    operation: 'Operations',
    // Configuration management
    configManagement: 'Configuration Management',
    // Set tags
    setTag: 'Set Tags',
    // Clear data
    clearData: 'Clear data',
    // Delete
    delete: 'Delete',
    // Customize list fields
    customListFields: 'Customize List Fields',
    // Clearing cache or changing browser will invalidate custom list settings.
    customListFieldsTip: 'Clearing cache or changing browser will invalidate custom list settings.',
    // Export bucket list
    exportBucketList: 'Export Bucket List',
    // Export range
    exportRange: 'Export Range',
    // Export all bucket list
    exportAllBucketList: 'Export All Bucket List',
    // Export selected bucket list only
    exportSelectedBucketList: 'Export Selected Bucket List Only',
    // Region cannot be modified after creation,
    regionTip1: 'Region cannot be modified after creation,',
    regionTip2: 'please choose carefully.',
    // Name
    name: 'Name',
    // Name cannot be modified after creation.
    nameTip: 'Name cannot be modified after creation.',
    // Bucket name cannot be modified after creation
    bucketNameTip: 'Bucket name cannot be modified after creation',
    // You can enter {0} more characters, supports lowercase letters, numbers and -;
    nameTip1: 'You can enter {0} more characters,',
    nameTip2: 'supports lowercase letters, numbers and -;',
    nameTip3: 'Bucket name consists of [custom name]-[APPID].',
    // Private read-write
    privateReadWrite: 'Private Read-Write',
    // Public read private write
    publicReadPrivateWrite: 'Public Read Private Write',
    // Public read-write
    publicReadWrite: 'Public Read-Write',
    // After authentication, users will get access to objects. You can authorize users through Set Access Permissions.
    readWriteTip1:
      'After authentication, users will get access to objects. You can authorize users through Set Access Permissions.',
    readWriteTip2:
      'No authentication required to read data in your bucket, high security risk, not recommended. Write operations require authentication.',
    readWriteTip3:
      'No authentication required to read and write data in your bucket, high security risk, not recommended.',
    readWriteTip4: 'Enabling public read permission may cause unexpected outbound traffic fees.',
    readWriteTip5:
      'If you must use public read permission, it is recommended to take measures to avoid unexpected fees, such as configuring anti-hotlinking.',
    // Default warning
    defaultWarning: 'Default Warning',
    // When outbound traffic exceeds 5000MB within 1 minute, a warning notification will be sent.
    defaultWarningTip: 'When outbound traffic exceeds 5000MB within 1 minute, a warning notification will be sent.',
    // Request domain
    requestDomain: 'Request Domain',
    // After creation, you can use this domain to access the bucket
    requestDomainTip1: 'After creation, you can use this domain to access the bucket',
    requestDomainTip2:
      'The default domain has security risks, it is recommended to configure a custom domain after creating the bucket.',
    // Version control
    versionControl: 'Version Control',
    // Enabling version control can recover data lost due to overwriting or accidental deletion.
    versionControlTip1: 'Enabling version control can recover data lost due to overwriting or accidental deletion.',
    versionControlTip2: 'Keeping multiple versions of objects in the same bucket will generate storage capacity fees.',
    // Server-side encryption
    serverEncryption: 'Server-side Encryption',
    // No encryption
    noEncryption: 'No Encryption',
    // SSE-COS encryption
    sseCosEncryption: 'SSE-OSS Encryption',
    // Use COS-managed keys for AES-256 server-side encryption
    sseCosEncryptionTip: 'Use OSS-managed keys for AES-256 server-side encryption',
    // When files are uploaded to COS, they are automatically encrypted and stored.
    sseCosEncryptionTip1: 'When files are uploaded to OSS, they are automatically encrypted and stored.',
    // (Not supported for modification after creation)
    notModifyAfterCreation: '(Not supported for modification after creation)',
    // Enable
    open: 'Enable',
    // Disable
    close: 'Disable',
    // Cancel
    cancel: 'Cancel',
    // Confirm
    confirm: 'Confirm',
    // Create
    create: 'Create',
    // Edit
    edit: 'Edit',
    // Retry
    retry: 'Retry',
    // Start
    start: 'Start',
    // Pause
    pause: 'Pause',
    // Clear records
    clearRecord: 'Clear Records',
    // View details
    viewDetails: 'View Details',
    // Save
    save: 'Save',
    // Previous step
    previousStep: 'Previous Step',
    // Next step
    nextStep: 'Next Step',
    // Basic information
    basicInformation: 'Basic Information',
    // Advanced optional configuration
    advancedOptionalConfiguration: 'Advanced Optional Configuration',
    // Confirm configuration
    confirmConfiguration: 'Confirm Configuration',
    // Only supports lowercase English letters, numbers and hyphens
    nameRule: 'Only supports lowercase English letters, numbers and hyphens',
    nameRule1: 'Bucket name cannot start or end with "-"',
    nameRule2: 'Request domain name cannot exceed {0} characters, current bucket name length exceeds the limit',
    nameCheckError: 'Bucket name already exists, please re-enter',
    // High risk
    highRisk: 'High Risk',
    highRiskTip:
      'The default domain has security risks, it is recommended to configure a custom domain after creating the bucket',
    createSuccess: 'Bucket created successfully',
    // Billing
    billing: 'Billing',
    // Note
    attention: 'Note',
    // Maximum bucket count limit reached
    maxBucketCount: 'Maximum bucket count limit reached',

    buyResourcePack: 'Buy Resource Pack',
    // Manual renewal
    manualRenewal: 'Manual Renewal',
    // Auto renewal
    autoRenewal: 'Auto Renewal',
    // Resource pack
    buyPack: {
      title: 'Object Storage OSS',
      // Annual and monthly combo pack
      tab1: 'Annual and Monthly Combo Pack',
      tab2: 'Add-on Resource Pack',
      region1: 'Hong Kong and Overseas Universal',
      region2: 'Mainland China Universal',
      categoryLabel1: 'Storage Capacity',
      categoryLabel2: 'Traffic',
      categoryLabel3: 'Read/Write Requests',
      categoryDesc1:
        'Storage capacity refers to the storage space occupied by user file data uploaded to OSS. Storage capacity fees are calculated based on storage capacity and storage duration.',
      categoryDesc2:
        'Traffic refers to the data traffic generated when users use and access OSS data. Traffic fees are calculated based on the cumulative value of actual traffic consumed by users.',
      categoryDesc3:
        'Read/write requests are generated when users perform data upload, download, query, deletion and other operations on OSS through API, SDK or console.',
      effective1: 'Effective Immediately',
      effective2: 'Effective at Specified Time',
      effectiveDesc1:
        'The resource pack will take effect on the day after payment is completed, and the effective date starts from that day',
      effectiveDesc2:
        'If the payment time is later than the specified effective time, the resource pack will take effect immediately after payment',
      // {0} years
      year: '{0} years',
      // {0} months
      month: '{0} months',
      column1: 'Resource Pack Name/Order Number',
      column2: 'Effective Region',
      column3: 'Source',
      column4: 'Billing Item',
      column5: 'Specification',
      column6: 'Resource Pack Usage',
      column7: 'Renewal Type',
      column8: 'Effective Time',
      column9: 'Expiration Time',
      columnDesc1: 'Represents the total amount within a cycle',
      columnDesc2:
        'Traffic pack and read/write count pack take one month as a cycle from the effective date, and the usage is the usage within one cycle.',
      columnDesc3:
        'Storage capacity pack usage: The usage that has been deducted from this capacity pack based on the current actual storage occupation.',
      renewType: 'Renewal',
      renewType1: 'Set as Auto Renewal',
      // Valid resource pack
      validPack: 'Valid Resource Pack',
      // Invalid resource pack
      invalidPack: 'Invalid Resource Pack',
      // Standard storage capacity pack
      standardStoragePack: 'Standard Storage Capacity Pack',
      // Public downstream traffic pack
      publicDownstreamTrafficPack: 'Public Downstream Traffic Pack',
      // Global acceleration traffic pack
      globalAccelerationTrafficPack: 'Global Acceleration Traffic Pack',
      // Standard storage request pack
      standardStorageRequestPack: 'Standard Storage Request Pack',
      // Prepaid
      prePay: 'Prepaid',
      // Platform gift
      platformGift: 'Platform Gift',
    },
    // Purchase page
    buyPage: {
      // Purchase notice
      notice: 'Purchase Notice',
      // Instructions
      instructions: 'Instructions',
      noticeDesc1:
        'Combo packs must include storage capacity, external network traffic, and request count. Resource packs are prepaid and cannot be deducted across regions.',
      noticeDesc2:
        'A bucket is a data storage space and is not directly bound to a resource package. The resource package itself does not store data.',
      // Billing rules
      billingRules: 'Billing Rules',
      billingRulesDesc1:
        'Combo resource packs take effect immediately after purchase and will no longer be deducted upon expiration or when the quota is exhausted, and corresponding functions will be restricted (insufficient traffic pack: data cannot be downloaded through the public network; insufficient capacity pack: data cannot be newly written; insufficient request pack: related operations may fail); resource packs cannot be used across regions.',
      billingRulesDesc2:
        'Resource pack types include: traffic pack, capacity pack, request pack. Resource packs take effect immediately or at a specified time after purchase, and will no longer be deducted upon expiration or when the quota is exhausted, and corresponding functions will be restricted (insufficient traffic pack: data cannot be downloaded through the public network; insufficient capacity pack: data cannot be newly written; insufficient request pack: related operations may fail) data in the bucket can be restored after re-purchasing or renewing resource packs within the grace period after the resource pack expires or is exhausted. Resource packs cannot be used across regions.',
      // Other instructions
      otherInstructions: 'Other Instructions',
      otherInstructionsDesc1:
        'Resource packs are limited to object storage OSS service and cannot be transferred, refunded or extended.',
      // Configure combo resource pack
      configureComboPack: 'Configure Combo Resource Pack',
      // Usage notes
      usageNotes: 'Usage Notes',
      usageNotesDesc1: 'Resource pack specifications can be stacked',
      usageNotesDesc2: 'Cannot deduct generated usage',
      usageNotesDesc3:
        'Combo packs take effect immediately after purchase, unused resource packs in the current cycle will not be accumulated to the next cycle',
      usageNotesDesc4: 'Unused resource packs in the current cycle will not be accumulated to the next cycle',
      // Effective region
      effectiveRegion: 'Effective Region',
      effectiveRegionChoice: 'Please select the universal region corresponding to the bucket region',
      eRTip: 'Mainland China region resources are under construction, please stay tuned',
      // Validity period
      validityPeriod: 'Validity Period',
      attentionDesc1:
        'It is recommended to check "Auto-renew upon expiration" to avoid business impact due to resource expiration shutdown or release. The auto-renewal cycle for monthly purchased resource packs is 1 month; the auto-renewal cycle for yearly purchased resource packs is 1 year.',
      // Auto-renew upon expiration
      autoRenewal: 'Auto-renew upon expiration',
      // Configure resource pack type and specification
      configurePackType: 'Configure Resource Pack Type and Specification',
      // Required
      required: 'Required',
      // Storage capacity pack
      storageCapacityPack: 'Storage Capacity Pack',
      storageCapacityPackDesc:
        'Storage capacity refers to the storage space occupied by user file data uploaded to OSS, charged based on occupied space and time',
      // Type
      type: 'Type',
      // Standard storage capacity
      standardStorageCapacity: 'Standard Storage Capacity',
      standardStorageCapacityDesc: 'Used to deduct standard storage capacity fees generated during data storage',
      // Traffic
      traffic: 'Traffic',
      // Purchase quantity
      buyCount: 'Purchase Quantity',
      // Read/write request pack
      readWriteRequestPack: 'Read/Write Request Pack',
      readWriteRequestPackDesc:
        'Read/write requests are generated when users perform data upload, download, query, deletion and other operations on OSS through API, SDK or console.',
      // Standard storage request
      standardStorageRequest: 'Standard Storage Request',
      standardStorageRequestDesc:
        '*Used to deduct read/write requests on OSS data, only for standard storage type data',
      // Select resource pack
      selectResourcePack: 'Select Resource Pack',
      // Billing item category
      billingItemCategory: 'Billing Item Category',
      // Resource pack type
      ResourcePackType: 'Resource Pack Type',
      // Resource pack specification
      resourcePackSpecifications: 'Resource Pack Specification',
      // Effective time
      effectiveTime: 'Effective Time',
      // Used to deduct the external network downstream traffic fees generated when data is downloaded to the local through the Internet.
      publicDownstreamTrafficDesc:
        'Used to deduct the external network downstream traffic fees generated when data is downloaded to the local through the Internet.',
      // Used to deduct the global acceleration traffic fees generated when data is uploaded or downloaded through the Internet using the global acceleration domain name after enabling the global acceleration function.
      globalAccelerationTrafficDesc:
        'Used to deduct the global acceleration traffic fees generated when data is uploaded or downloaded through the Internet using the global acceleration domain name after enabling the global acceleration function.',
      // Used to deduct read/write requests on OSS data, only for standard storage type data.
      standardStorageCapacityDesc1: 'Used to deduct standard storage capacity fees generated during data storage',
      // Traffic pack
      trafficPack: 'Traffic Pack',
      trafficPackDesc:
        'Traffic refers to the data traffic generated when users use and access OSS data, calculated based on the cumulative value of actual traffic consumed by users.',
      // Public downstream traffic
      publicDownstreamTraffic: 'Public Downstream Traffic',
      // Global acceleration traffic
      globalAccelerationTraffic: 'Global Acceleration Traffic',
      // Current cost
      currentCost: 'Current Cost',
      // Configure cost details
      configureCostDetails: 'Configure Cost Details',
      // Actual discount amount is subject to the order page
      actualDiscountAmount: 'Actual discount amount is subject to the order page',
      // Billing item
      billingItem: 'Billing Item',
      // Price
      price: 'Price',
      // Original price
      originalPrice: 'Original Price',
      // Buy now
      buyNow: 'Buy Now',
      // 资源包购买提示
      inquiryIncompleteError:
        'The current duration does not support the "Storage + Traffic + Read/Write Requests" combo package. We recommend selecting another duration for purchase',
      inquiryIncompleteError1:
        'The current duration does not support the "Storage + Traffic + Read/Write Requests" combo package. Click to go to  {0}  to purchase separately',
    },
    fileList: {
      accessDesc: 'After authentication, users will get access to objects. You can authorize users through {0}.',
      // Confirm rename prompt
      confirmRenameDesc:
        'There is a file with the same name in the current path {0}. After renaming, it will directly overwrite the file with the same name. Do you want to continue?',
      // Task center
      taskCenter: 'Task Center',
      // In progress
      taskInProgress: 'In Progress ({0})',
      // Execution successful
      taskSuccess: 'Execution Successful ({0})',
      // Execution failed
      taskFailed: 'Execution Failed ({0})',
      // are you sure to delete the currently selected bucket?
      confirmDeleteBucket: 'are you sure to delete the currently selected bucket?',
      deleteBucketTip:
        'Note: Before deletion, you need to detect the resources in the bucket to ensure that the resources under the bucket have been cleared and closed before deletion can be performed. {0}',
      // After deleting the bucket, data cannot be recovered and accessed.
      deleteBucketTip1: 'After deleting the bucket, data cannot be recovered and accessed.',
      // File/History version
      fileHistory: 'File/History Version',
      // Detecting...
      checking: 'Detecting...',
      // Deleted files/history versions in the bucket
      deletedFileHistory: 'Deleted files/history versions in the bucket',
      // Please delete the uncleared files/history versions in the bucket.
      pleaseDeleteFileHistory: 'Please delete the uncleared files/history versions in the bucket.',
      // Go to clear bucket
      goClearBucket: 'Go to Clear Bucket',
      // File fragments
      fileFragments: 'File Fragments',
      // Deleted all file fragments in the bucket
      deletedFileFragments: 'Deleted all file fragments in the bucket',
      // Please delete all file fragments in the bucket
      pleaseDeleteFileFragments: 'Please delete all file fragments in the bucket',
      // Bound CDN acceleration domain name
      boundCdnDomain: 'Bound CDN Acceleration Domain Name',
      // Default CDN acceleration domain name and custom CDN acceleration domain name have been closed.
      closedCdnDomain: 'Default CDN acceleration domain name and custom CDN acceleration domain name have been closed.',
      // Go to close
      goClose: 'Go to Close',
      // Delete bucket
      deleteBucket: 'Delete Bucket',
      // Recheck
      recheck: 'Recheck',
      // Deleting bucket
      deletingBucket: 'Deleting Bucket',
      // Bucket deleted successfully
      deleteBucketSuccess: 'Bucket Deleted Successfully',
      // are you sure to clear the currently selected bucket?
      confirmClearBucket: 'are you sure to clear the currently selected bucket?',
      // Clearing the bucket will delete all files, history versions, and file fragments in your storage. After deletion, data cannot be recovered and accessed.
      clearBucketWarning:
        'Clearing the bucket will delete all files, history versions, and file fragments in your storage. After deletion, data cannot be recovered and accessed.',
      // Please enter bucket name
      enterBucketName: 'Please enter bucket name',
      // to confirm the clear operation
      confirmClearOperation: 'to confirm the clear operation',
      // Confirm clear
      confirmClear: 'Confirm Clear',
      // are you sure to clear the bucket?
      confirmClearBucketOperation: 'are you sure to clear the bucket?',
      // Confirm clear bucket prompt
      confirmClearBucketTip:
        'Clearing the bucket will clear all objects in your bucket, including history versions of objects and uncompleted upload fragments {0}. If you confirm to clear the bucket, please click the confirm button to execute.',
      // (data cannot be recovered after clearing)
      clearBucketTip: '(data cannot be recovered after clearing)',
      // Bucket has been cleared
      bucketCleared: 'Bucket has Been Cleared',
      // Delete object task-{0}
      deleteObjectTask: 'Delete Object Task-{0}',
      // 修改访问权限任务-{0}
      modifyAccessPermissionTask: 'Modify Access Permission Task-{0}',
      // Clearing bucket
      clearingBucket: 'Clearing Bucket',
      // Back to bucket list
      backToBucketList: 'Back to Bucket List',
      // Overview
      overview: 'Overview',
      // File list
      fileList: 'File List',
      // safetyManagement
      safetyManagement: 'Safety Management',
      // permissionManagement
      permissionManagement: 'Permission Management',
      // 域名管理
      DomainConfig: 'Domain Management',
      // Configuration management
      configManagement: 'Configuration Management',
      // data monitoring
      dataMonitoring: 'data Monitoring',
      // Upload file
      uploadFile: 'Upload File',
      // Create folder
      createFolder: 'Create Folder',
      // Fragment management
      fragmentManagement: 'Fragment Management',
      // Clear bucket
      clearBucket: 'Clear Bucket',
      // Only supports searching objects under the current virtual directory
      searchFileTip: 'Only supports searching objects under the current virtual directory',
      // Only supports searching objects under the current virtual directory and its subdirectories
      searchFileTip1: 'Only supports searching objects under the current virtual directory and its subdirectories',
      // Prefix search
      prefixSearch: 'Prefix Search',
      // Fuzzy search
      fuzzySearch: 'Fuzzy Search',
      // File name
      fileName: 'File Name',
      // Rename object
      renameObject: 'Rename Object',
      // Virtual directory does not support renaming
      virtualDirectoryRenameNotSupported: 'Virtual Directory Does Not Support Renaming',
      // File size
      fileSize: 'File Size',
      // Storage type
      StorageType: 'Storage Type',
      // Details
      details: 'Details',
      // Download
      download: 'Download',
      // Modify access permission
      modifyAccessPermission: 'Modify Access Permission',
      // Set permission
      setPermission: 'Set Permission',
      // are you sure to delete the following 1 object?
      confirmDeleteObject: 'are you sure to delete the following 1 object?',
      // are you sure to delete this folder?
      confirmDeleteFolder: 'are you sure to delete this folder?',
      // are you sure to delete the following files/folders?
      confirmDeleteFilesFolders: 'are you sure to delete the following files/folders?',
      // Files cannot be recovered after deletion, please operate with caution.
      deleteWarning: 'Files cannot be recovered after deletion, please operate with caution.',
      // 1. If you select a folder to delete, all objects in that folder will be deleted, and any new objects added during the deletion operation may also be deleted.
      deleteWarningTip1:
        '1. If you select a folder to delete, all objects in that folder will be deleted, and any new objects added during the deletion operation may also be deleted.',
      // 2. If you select an object to delete, any new object with the same name uploaded before the deletion operation is completed will also be deleted.
      deleteWarningTip2:
        '2. If you select an object to delete, any new object with the same name uploaded before the deletion operation is completed will also be deleted.',
      // 3. The deletion operation cannot be recovered. are you sure to execute the deletion?
      deleteWarningTip3: '3. The deletion operation cannot be recovered. are you sure to execute the deletion?',
      // Modified time
      modifiedTime: 'Modified Time',
      // Public permission
      publicPermission: 'Public Permission',
      // Inherited permission
      inheritedPermission: 'Inherited Permission',
      // The access permission of this file is subject to the bucket access permission.
      inheritedPermissionTip: 'The access permission of this file is subject to the bucket access permission.',
      // Set access permission
      setAccessPermission: 'Set Access Permission',
      // No authentication required to read data in your bucket, high security risk, not recommended. Write operations require authentication.
      noAuthReadWarning:
        'No authentication required to read data in your bucket, high security risk, not recommended. Write operations require authentication.',
      // Create folder
      createNewFolder: 'Create New Folder',
      // Folder name cannot be empty
      createNewFolderRuleTip1: 'Folder name cannot be empty',
      // Folder name cannot start with /
      createNewFolderRuleTip2: 'Folder name cannot start with /',
      // Folder name cannot contain consecutive /
      createNewFolderRuleTip3: 'Folder name cannot contain consecutive /',
      // Folder name cannot be ..
      createNewFolderRuleTip4: 'Folder name cannot be ..',
      // Folder name can only contain numbers, Chinese and English, and visible characters
      createNewFolderRuleTip5: 'Folder name can only contain numbers, Chinese and English, and visible characters',
      // Folder name
      folderName: 'Folder Name',
      // 1. Can use a combination of numbers, Chinese and English, and visible characters
      folderNameTip1: '1. Can use a combination of numbers, Chinese and English, and visible characters',
      // 2. Use / to split paths to quickly create subdirectories
      folderNameTip2: '2. Use / to split paths to quickly create subdirectories',
      // 3. Not allowed: empty folder; consecutive /; starting with /
      folderNameTip3: '3. Not allowed: empty folder; consecutive /; starting with /',
      // 4. Not allowed to use .. as folder name
      folderNameTip4: '4. Not allowed to use .. as folder name',
      // Please enter folder name
      enterFolderName: 'Please enter folder name',
      // You are about to rename {0} to:
      renameObjectTip: 'You are about to rename {0} to:',
      // File name cannot contain slash "/"
      fileNameCannotContainSlash: 'File name cannot contain slash "/"',
      // There is a file with the same name in the current path
      sameFileNameExists: 'There is a file with the same name in the current path',
      // Standard storage
      standardStorage: 'Standard Storage',
      // Infrequent access storage
      infrequentAccess: 'Infrequent Access Storage',
      // Archive storage
      archiveStorage: 'Archive Storage',
      // Deleting
      deleting: 'Deleting',
      // Delete successful
      deleteSuccess: 'Delete Successful',
      // Access permission modified successfully
      accessPermissionModifiedSuccessfully: 'Access Permission Modified Successfully',
      // Folder created successfully
      folderCreatedSuccessfully: 'Folder Created Successfully',
      // Rename successful
      renameSuccess: 'Rename Successful',
      // Name length cannot exceed 850 bytes
      renameRuleTip: 'Name length cannot exceed 850 bytes',
      // Name cannot start with / or \
      renameRuleTip1: 'Name cannot start with / or \\',
      // Name cannot contain control characters
      renameRuleTip2: 'Name cannot contain control characters',
      // Downloading file
      downloadingFile: 'Downloading File',
      // Failed to get download URL
      getDownloadUrlFailed: 'Failed to Get Download URL',
      // Upload to
      uploadTo: 'Upload to',
      // Select file
      selectFile: 'Select File',
      // Select folder
      selectFolder: 'Select Folder',
      uploadTip:
        '1. If there is a file with the same name in the upload path, it will be overwritten by the newly uploaded file. If you want to keep multiple versions of files/folders, please enable version control.',
      uploadTip1:
        '2. Upload operations will generate request count and upstream traffic, where requests are charged per 10,000 times, and upstream traffic is free.',
      uploadTip2:
        'Drag and drop files/folders to this area to upload, or select files/folders. The size of a single file cannot exceed 5GB',
      // File/Folder
      fileFolder: 'File/Folder',
      // Size
      size: 'Size',
      // Status
      status: 'Status',
      // Progress
      progress: 'Progress',
      // Added
      added: 'Added',
      // File size exceeds limit, not added
      fileSizeExceedsLimitNotAdded: 'File size exceeds limit, not added',
      // Remove
      remove: 'Remove',
      // File count: {0}
      fileCount: 'File count: {0}',
      // Total size: {0}
      totalSize: 'Total size: {0}',
      // Advanced settings (optional)
      advancedSettings: 'Advanced Settings (optional)',
      // File access permission
      fileAccessPermission: 'File Access Permission',
      // Upload
      upload: 'Upload',
      // Uploading file
      uploadingFile: 'Uploading File',
      // File upload failed, please try again later
      fileUploadFailed: 'File upload failed, please try again later',
      // Upload task-{0}
      uploadTask: 'Upload Task-{0}',
      // File fragment management
      fileFragmentManagement: 'File Fragment Management',
      // Clear fragments
      clearFragments: 'Clear Fragments',
      // Please enter file name (object path)
      enterFileName: 'Please enter file name (object path)',
      // Fragment file name
      fragmentFileName: 'Fragment File Name',
      // Upload task ID
      uploadTaskId: 'Upload Task ID',
      // More information
      moreInfo: 'More Information',
      // Multipart upload information
      multipartUploadInfo: 'Multipart Upload Information',
      // Object path
      objectPath: 'Object Path',
      // Uploaded size
      uploadedSize: 'Uploaded Size',
      // Uploaded fragment count
      uploadedFragmentCount: 'Uploaded Fragment Count',
      // are you sure to delete the path
      confirmDeletePath: 'are you sure to delete the path',
      // file fragment?
      confirmDeletePathTip: 'file fragment?',
      // are you sure to clear all file fragments in this bucket?
      ensureClearAllFragments: 'are you sure to clear all file fragments in this bucket?',
      // Delete file fragments
      deleteFileFragments: 'Delete File Fragments',
      // Clearing fragments
      clearingFragments: 'Clearing Fragments',
      // File details
      fileDetails: 'File Details',
      // Object name
      objectName: 'Object Name',
      // Object size
      objectSize: 'Object Size',
      // Specify domain name
      specifyDomainName: 'Specify Domain Name',
      // If relevant domain names have been configured or added, selecting different domain names will change the object address accordingly.
      specifyDomainNameTip:
        'If relevant domain names have been configured or added, selecting different domain names will change the object address accordingly.',
      // Default origin domain name
      defaultOriginDomainName: 'Default Origin Domain Name',
      // Object URL
      objectUrl: 'Object URL',
      // If public access permissions have been set for the bucket or object, you can directly copy the object URL to download the object.
      objectUrlTip:
        'If public access permissions have been set for the bucket or object, you can directly copy the object URL to download the object.',
      // Preview not supported
      previewNotSupported: 'Preview Not Supported',
      // Object access permission
      objectAccessPermission: 'Object Access Permission',
      // Encryption method
      encryptionMethod: 'Encryption Method',
      // Failed to get upload credentials
      getUploadCredentialsFailed: 'Failed to Get Upload Credentials',
      // Task list
      taskList: 'Task List',
      // Refreshing or closing the browser will cancel all current tasks and clear all records.
      taskListTip: 'Refreshing or closing the browser will cancel all current tasks and clear all records.',
      // 修改加密方式任务-{0}
      modifyEncryptionMethodTask: 'Modify Encryption Method Task-{0}',
      // 复制任务-{0}
      copyTask: 'Copy Task-{0}',
      // Task name
      taskName: 'Task Name',
      // Task status
      taskStatus: 'Task Status',
      // Completed task count
      completedTaskCount: 'Completed Task Count',
      // Upload failed, it is recommended to check the network connection or try again later.
      uploadFailed: 'Upload failed, it is recommended to check the network connection or try again later.',
      // 设置失败，建议检查网络连接，或稍后重新尝试。
      setFailed: 'Setting failed, it is recommended to check the network connection or try again later.',
      // Executing
      executing: 'Executing',
      // Paused
      paused: 'Paused',
      // Execution failed
      executionFailed: 'Execution Failed',
      // Execution successful
      executionSuccess: 'Execution Successful',
    },
    s6: {
      // This bucket has SSE-OSS encryption enabled. Encrypted objects cannot be set to unencrypted. Please disable bucket encryption and try again.
      sseOssEncrypted:
        'This bucket has SSE-OSS encryption enabled. Encrypted objects cannot be set to unencrypted. Please disable bucket encryption and try again.',
      // Copy
      copy: 'Copy',
      // Copy File
      copyFile: 'Copy File',
      // Copy Successful
      copySuccess: 'Copy file successfully, you can go to the target path and paste it.',
      // File Copy Completed
      copyFileCompleted: 'Paste file completed',
      // Paste File
      pasteFile: 'Paste File',
      // About to copy {0} files. The destination path already contains files/folders with the same names. Please confirm the operation.
      confirmCopy:
        'About to copy {0} files. The destination path already contains files/folders with the same names. Please confirm the operation.',
      // Skip
      skip: 'Skip',
      // Overwrite
      overwrite: 'Overwrite',
      // Pasting in the original location is not allowed
      notAllowPaste: 'Pasting in the original location is not allowed',
      // Pasting parent directory into child directory is not allowed
      notAllowPasteToChild: 'Pasting parent directory into child directory is not allowed',
      // Usage Trend
      usageTrend: 'Usage Trend',
      // Storage Usage Trend (GB)
      storageUsageTrend: 'Storage Usage Trend (GB)',
      // Traffic Trend (MB)
      trafficTrend: 'Traffic Trend (MB)',
      // Request Count Trend
      requestCountTrend: 'Request Count Trend',
      // Usage Overview
      usageOverview: 'Usage Overview',
      // Usage data is not real-time and may have delays. It is for reference only and not used for billing.
      usageOverviewTip:
        'Usage data is not real-time and may have delays. It is for reference only and not used for billing.',
      bucketUsageOverviewTip: 'Usage overview data is delayed by about 2 hours and is for reference only, not billing.',
      goToBillingDetails: 'For billable usage, view usage details in the Billing Center.',
      comparedWithYesterday: 'vs. yesterday',
      comparedWithLastMonth: 'vs. same period last month',
      lastMonthInternetTraffic: 'Last month internet downlink traffic',
      lastMonthReadRequests: 'Last month read requests',
      bucketConfiguration: 'Bucket Configuration',
      multiAZFeature: 'Multi-AZ',
      crossDomainAccess: 'Cross-Origin Access',
      originPull: 'Origin Pull',
      inventory: 'Inventory',
      lifecycle: 'Lifecycle',
      logManagement: 'Log Management',
      metadataAcceleration: 'Metadata Acceleration',
      bucketEncryption: 'Bucket Encryption',
      antiLeech: 'Hotlink Protection',
      bucketReplication: 'Bucket Replication',
      enabled: 'Enabled',
      notEnabled: 'Not Enabled',
      notConfigured: 'Not Configured',
      ruleCount: '{count} Rules',
      // Default Domain Name
      defaultDomainName: 'Default Domain Name',
      // Storage Capacity
      storageCapacity: 'Storage Capacity',
      // Bucket Count
      bucketCount: 'Bucket Count',
      // Object Count
      objectCount: 'Object Count',
      // Total Object Count
      totalObjectCount: 'Total Object Count',
      // Monthly Average Standard Storage Capacity
      monthlyAverageStandardStorageCapacity: 'Monthly Average Standard Storage Capacity',
      // Current total number of buckets
      currentBucketTotal: 'Current total number of buckets',
      // Data statistics cutoff time: {0}
      dataStatisticsDeadline: 'Data statistics cutoff time: {0}',
      // Internet Downlink Traffic This Month
      internetTraffic: 'Internet Downlink Traffic This Month',
      // Read Request Count This Month
      readRequestCount: 'Read Request Count This Month',
      // Count
      count: 'Count',
      // Times
      times: 'Times',
      // Current Month
      currentMonth: 'Current Month',
      // Last 7 Days
      last7Days: 'Last 7 Days',
      // Last 30 Days
      last30Days: 'Last 30 Days',
      // Bucket Access Permission
      bucketAccessPermission: 'Bucket Access Permission',
      // Access Management CAM
      accessManagementCAM: 'Access Management CAM',
      // Current Status
      currentStatus: 'Current Status',
      // Access Management (Cloud Access Management, CAM) is a unified permission control service provided by Cat Cloud for securely managing access permissions to cloud resources under the account. Users can create and manage roles and control their access scope through policies to achieve permission allocation and reduce privilege escalation and account risks.
      accessManagementCAMTip: `Access Management (Cloud Access Management, CAM) is a unified permission control service provided by ${appNameMap.en} for securely managing access permissions to cloud resources under the account. Users can create and manage roles and control their access scope through policies to achieve permission allocation and reduce privilege escalation and account risks.`,
      // Go to CAM Console
      goCAMConsole: 'Go to CAM Console',
      // Anti-Leech Settings
      antiLeechSetting: 'Anti-Leech Settings',
      // Server-side encryption automatically encrypts data when writing to storage, ensuring data security without additional user operations.
      serverSideEncryption:
        'Server-side encryption automatically encrypts data when writing to storage, ensuring data security without additional user operations.',
      // Anti-leech is a security measure that prevents unauthorized referencing of resources by external websites or programs through blacklist/whitelist configuration, avoiding unauthorized traffic consumption.
      antiLeechSettingTip:
        'Anti-leech is a security measure that prevents unauthorized referencing of resources by external websites or programs through blacklist/whitelist configuration, avoiding unauthorized traffic consumption.',
      // Source Type
      sourceType: 'Source Type',
      // Empty Referer
      emptyReferer: 'Empty Referer',
      // HTTP request header with empty referer (i.e., without referer field or with empty referer field)
      emptyRefererTip:
        'HTTP request header with empty referer (i.e., without referer field or with empty referer field)',
      // Configuration Status
      configStatus: 'Configuration Status',
      // Please enter domain name or IP address
      pleaseEnterDomainOrIP: 'Please enter domain name or IP address',
      // Maximum of 10 lines allowed
      maxInput10Lines: 'Maximum of 10 lines allowed',
      // Maximum of 200 characters
      maxCharacter200: 'Maximum of 200 characters',
      // No need to include protocol http(s)://
      noNeedProtocol: 'No need to include protocol http(s)://',
      // Incorrect domain name or IP format
      domainOrIPFormatError: 'Incorrect domain name or IP format',
      // Enter domain name or IP address, supports multiple lines (max 10), supports wildcard *, e.g., *.test.com; no need to include protocol http(s)://
      pleaseEnterDomainOrIPTip:
        'Enter domain name or IP address, supports multiple lines (max 10), supports wildcard *, e.g., *.test.com; no need to include protocol http(s)://',
      // Allow
      allow: 'Allow',
      // Reject
      reject: 'Reject',
      // Whitelist
      whiteList: 'Whitelist',
      // Blacklist
      blackList: 'Blacklist',
      // Resource Package
      resourcePackage: 'Resource Package',
      // Modify Encryption Method
      modifyEncryptionMethod: 'Modify Encryption Method',
      // In Effect
      effective: 'In Effect',
      // About to Expire
      willExpire: 'About to Expire',
      // Resource packages expiring within 7 days
      resourcePackageWillExpire: 'Resource packages expiring within 7 days',
      // Recently Accessed Buckets
      recentAccessBucket: 'Recently Accessed Buckets',
      viewMore: 'View More',
      learnMore: 'Learn More',
      gettingStarted: 'Getting Started',
      createBucketGuide:
        'A bucket is a container for objects in any format. Manage it through the console, APIs, or SDKs.',
      manageObjects: 'Manage Objects',
      manageObjectsGuide:
        'Objects are the basic units of object storage. Upload, download, copy, preview, and edit them efficiently.',
      viewUsageStatistics: 'View Usage Statistics',
      viewUsageStatisticsGuide: 'Review monitoring and usage statistics to understand resource status in time.',
      buyResourcePackageGuide: 'Resource packages are prepaid discount plans that can be selected as needed.',
      helpDocs: 'Help Documentation',
      productOverview: 'Overview',
      productOverviewSummary: 'Introduction to massive object-based storage',
      basicConcepts: 'Basic Concepts',
      basicConceptsSummary: 'Buckets are containers used to store objects',
      mainFeatures: 'Main Features',
      mainFeaturesSummary: 'Core operations provide multiple object management capabilities',
      productAdvantages: 'Advantages',
      productAdvantagesSummary: 'Secure and reliable with HTTPS/SSL support',
      // Standard Storage Capacity
      standardStorageCapacity: 'Standard Storage Capacity',
      // Public Network Downlink Traffic
      internetTrafficOut: 'Public Network Downlink Traffic',
      // CDN Origin Traffic
      cdnTraffic: 'CDN Origin Traffic',
      // Read Request Count
      totalReadRequestCount: 'Read Request Count',
      // Write Request Count
      writeRequestCount: 'Write Request Count',
    },
    s7: {
      // Custom domain name
      customDomainName: 'Custom Domain Name',
      // Configure a custom domain name by binding your own domain to the bucket where the files are stored, enabling access to objects in the bucket through your own domain.
      customDomainNameTip:
        'Configure a custom domain name by binding your own domain to the bucket where the files are stored, enabling access to objects in the bucket through your own domain.',
      // Please go to your domain name resolution service provider to configure a CNAME record, pointing the domain to your bucket via CNAME.
      pleaseGoToYourDomainNameResolver:
        'Please go to your domain name resolution service provider to configure a CNAME record, pointing the domain to your bucket via CNAME.',
      // Add domain name
      addDomainName: 'Add Domain Name',
      // No valid CNAME record pointing to the current bucket detected. Please confirm that the CNAME record has been correctly configured in the relevant business region.
      noValidCnameRecord:
        'No valid CNAME record pointing to the current bucket detected. Please confirm that the CNAME record has been correctly configured in the relevant business region.',
      // 上线
      online: 'Online',
      // 下线
      offline: 'Offline',
      // Before deleting a domain name, please first modify the domain name to offline status.
      pleaseModifyDomainNameToOfflineStatus:
        'Before deleting a domain name, please first modify the domain name to offline status.',
      // Add custom domain name
      addCustomDomainName: 'Add Custom Domain Name',
      // Domain name
      domainName: 'Domain Name',
      // Please enter domain name
      pleaseEnterDomainName: 'Please enter domain name',
      // Only supports binding specific domain names (e.g., cdn.example.com), not wildcard domains (*.example.com) or addresses containing protocols (http://, https://), ports, or paths.
      pleaseEnterDomainNameTip:
        'Only supports binding specific domain names (e.g., cdn.example.com), not wildcard domains (*.example.com) or addresses containing protocols (http://, https://), ports, or paths.',
      // Bound bucket
      boundBucket: 'Bound Bucket',
      // Confirm delete domain name?
      confirmDeleteDomainName: 'Confirm delete domain name?',
      deleteDomainTip:
        'are you sure you want to delete the custom domain name {0}? After deletion, you will not be able to access the bucket through this domain name.',
      // Domain name cannot contain spaces, underscores, or Chinese characters
      pleaseEnterDomainNameTip1: 'Domain name cannot contain spaces, underscores, or Chinese characters',
      // Please enter a pure domain name without protocol, port, or path
      pleaseEnterDomainNameTip2: 'Please enter a pure domain name without protocol, port, or path',
      // Wildcard domain names are not supported
      pleaseEnterDomainNameTip3: 'Wildcard domain names are not supported',
      // Please enter a complete domain name, e.g., example.com
      pleaseEnterDomainNameTip4: 'Please enter a complete domain name, e.g., example.com',
      // Custom domain name configuration successful, will take effect within approximately 30 minutes
      customDomainNameConfigSuccess:
        'Custom domain name configuration successful, will take effect within approximately 30 minutes',
      // Domain name binding successful, please go to your DNS service provider to configure CNAME resolution to complete the activation
      domainNameBindingSuccess:
        'Domain name binding successful, please go to your DNS service provider to configure CNAME resolution to complete the activation',
      // Domain name not registered
      domainNameNotRegistered: 'Domain Name Not Registered',
      // Your domain name has not been registered and cannot be bound to a bucket in mainland China. Please try binding after registration. If registration is complete, due to data latency, please wait 1-2 hours before retrying.
      domainNameNotRegisteredTip:
        'Your domain name has not been registered and cannot be bound to a bucket in mainland China. Please try binding after registration. If registration is complete, due to data latency, please wait 1-2 hours before retrying.',
      // Add failed
      addFailed: 'Add Failed',
      // This domain name has been bound to another bucket on this platform. Each domain name can only be bound to one bucket. Please change the domain name or unbind the existing one before retrying.
      addFailedTip:
        'This domain name has been bound to another bucket on this platform. Each domain name can only be bound to one bucket. Please change the domain name or unbind the existing one before retrying.',
      // Add failed, domain name already exists
      addFailedTip1: 'Add failed, domain name already exists',
      // Cross-domain access settings
      crossDomainAccessSetting: 'Cross-Domain Access Settings',
      // Cross-Origin Resource Sharing (CORS), also known as cross-domain access, allows web application servers to control cross-domain access, ensuring the security of cross-domain data transmission.
      crossDomainAccessSettingTip:
        'Cross-Origin Resource Sharing (CORS), also known as cross-domain access, allows web application servers to control cross-domain access, ensuring the security of cross-domain data transmission.',
      // Cross-domain rules take effect with a delay and will be effective within 15 minutes of successful configuration. If the list is not updated after adding or updating, please refresh the page later.
      crossDomainAccessSettingTip1:
        'Cross-domain rules take effect with a delay and will be effective within 15 minutes of successful configuration. If the list is not updated after adding or updating, please refresh the page later.',
      // Add rule
      addRule: 'Add Rule',
      // Edit rule
      editRule: 'Edit Rule',
      // Settings successful
      setSuccess: 'Settings Successful',
      // Settings failed, please try again later
      setFailed: 'Settings failed, please try again later',
      // One Origin per line, supports the following domain formats: http://www.example.com, http://*.example.com, http://www.example.com:8080 (does not support direct wildcard settings)
      addRuleTip:
        'One Origin per line, supports the following domain formats: http://www.example.com, http://*.example.com, http://www.example.com:8080 (does not support direct wildcard settings)',
      // Domain names start with http:// or https://, one per line, with at most one wildcard * per line
      addRuleTip1: 'Domain names start with http:// or https://, one per line, with at most one wildcard * per line',
      // Recommended to fill in *; supports multi-line input
      addRuleTip2: 'Recommended to fill in *; supports multi-line input',
      // Informs the server when sending OPTIONS requests which custom HTTP request headers can be used in subsequent requests, e.g., x-cos-meta-md5
      addRuleTip3:
        'Informs the server when sending OPTIONS requests which custom HTTP request headers can be used in subsequent requests, e.g., x-cos-meta-md5',
      // Supports multi-line input
      addRuleTip4: 'Supports multi-line input',
      // Expose-Headers returns common headers of OSS
      addRuleTip5: 'Expose-Headers returns common headers of OSS',
      // Validity period of OPTIONS request result, must be a positive integer not exceeding 8 digits
      addRuleTip6: 'Validity period of OPTIONS request result, must be a positive integer not exceeding 8 digits',
      // Source Origin
      sourceOrigin: 'Origin',
      // Operation Methods
      operationMethods: 'Methods',
      // Timeout Max-Age
      timeoutMaxAge: 'Max-Age',
      // Delete cross-domain rule
      deleteCrossDomainRule: 'Delete Cross-Domain Rule',
      // are you sure you want to delete this cross-domain setting rule?
      confirmDeleteCrossDomainRule: 'are you sure you want to delete this cross-domain setting rule?',
      // Please enter source
      pleaseEnterSource: 'Please enter source',
      // Maximum of 500 lines can be entered
      maxInput500: 'Maximum of 500 lines can be entered',
      // Please enter domain name in correct format, starting with http:// or https://, one per line, with at most one wildcard * per line
      pleaseEnterCorrectDomainName:
        'Please enter domain name in correct format, starting with http:// or https://, one per line, with at most one wildcard * per line',
      // Origin cannot contain spaces
      pleaseEnterCorrectDomainName1: 'Origin cannot contain spaces',
      // Please enter correct domain name format
      pleaseEnterCorrectDomainName2: 'Please enter correct domain name format',
      // Please select at least one Method
      pleaseSelectAtLeastOneMethod: 'Please select at least one Method',
      // Please enter Allow-Headers
      pleaseEnterAllowHeaders: 'Please enter Allow-Headers',
      // Allow-Headers cannot contain spaces
      pleaseEnterAllowHeaders1: 'Allow-Headers cannot contain spaces',
      // Allow-Headers can only contain letters, numbers, "-", "*"
      pleaseEnterAllowHeaders2: 'Allow-Headers can only contain letters, numbers, "-", "*"',
      // Max-age must be a positive integer
      pleaseEnterPositiveInteger: 'Max-age must be a positive integer',
      // Max-age cannot exceed 8 digits
      pleaseEnterMaxAge: 'Max-age cannot exceed 8 digits',
      // Paste failed, please enable clipboard permissions in browser settings
      pasteFailed: 'Paste failed, please enable clipboard permissions in browser settings',
      // Please check network connection or cross-domain access settings
      checkNetworkOrCrossDomainSettings: 'Please check network connection or cross-domain access settings',
      // 开始批量修改访问权限
      startBatchModifyAccessPermission: 'Start batch modifying access permissions',
      // 开始批量修改加密方式
      startBatchModifyEncryptionMethod: 'Start batch modifying encryption methods',
      // 开始粘贴文件
      startBatchCopyFiles: 'Start pasting the file',
      // 修改中...
      modifying: 'Modifying...',
      completedTaskCount: '(Success: {0}, Failure: {1})',
      // 网络连接失败请刷新页面后后重试
      networkConnectionFailed: 'Network connection failed please refresh the page and try again',
    },
  },
}
